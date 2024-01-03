import { BaseGuildVoiceChannel, ChannelType, Client, GatewayIntentBits, Guild, GuildMember } from "discord.js";
import { AudioPlayer, NoSubscriberBehavior, createAudioPlayer, createAudioResource, getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import prism from "prism-media";
import { Readable, pipeline } from "stream";
import AIUser, { getAIUser } from "./aiUser";
import { assistantNonStreaming, assistantStreaming, speechToText } from "./components/engines/openai";
import settings from "./settings";
import { textToSpeechNonStreaming, textToSpeechStreaming } from "./components/engines/gemelo_charactr";
import * as elevenlabs from './components/engines/elevenlabs';

// These values are chosen for compatibility with picovoice components
const DECODE_FRAME_SIZE = 1024;
const DECODE_SAMPLE_RATE = 16000;

export default class DiscordClient {
    private apiToken: string;
    private client: Client;

    constructor() {
        this.apiToken = settings.DISCORD_API_TOKEN;
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
        });

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}`);
            console.log('Use this URL to add the bot to your server:');
            console.log(`https://discord.com/oauth2/authorize?client_id=${this.client.user?.id}&scope=bot`);
            this.onReady();
        });
        this.client.login(this.apiToken);
        this.client.on('voiceStateUpdate', (oldState, newState) => {
            if (newState.member.user.bot) return;
            if (newState.channelId != null && newState.channelId != oldState.channelId) {
                this.joinChannel(newState.channel);
            }
        });
        this.client.on('guildCreate', (guild) => {
            console.log(`Joined guild ${guild.name}`);
            this.scanGuild(guild);
        });
    }

    private async onReady() {
        const guilds = await this.client.guilds.fetch();
        // Iterate through all guilds
        for (const [guildId, guild] of guilds) {
            const fullGuild = await guild.fetch();
            this.scanGuild(fullGuild);
        }
    }

    private async scanGuild(guild: Guild) {
        // Iterate through all voice channels fetching the largest one with at least one connected member
        const channels = (await guild.channels.fetch())
            .filter(channel => channel.type == ChannelType.GuildVoice);
        var chosenChannel: BaseGuildVoiceChannel = null;

        for (const [id, channel] of channels) {
            const voiceChannel = channel as BaseGuildVoiceChannel;
            if (voiceChannel.members.size > 0 && (chosenChannel == null || voiceChannel.members.size > chosenChannel.members.size)) {
                chosenChannel = voiceChannel;
            }
        }

        if (chosenChannel != null) {
            this.joinChannel(chosenChannel);
        }
    }

    private async joinChannel(channel: BaseGuildVoiceChannel) {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });

        for (const [id, member] of channel.members) {
            this.monitorMember(member);
        }

        connection.receiver.speaking.on('start', (userId) => {
            const user = channel.members.get(userId);
            if (user.user.bot) return;
            var aiUser = getAIUser(userId);
            console.log(`User ${user?.displayName} started speaking`);
            aiUser.start();
            this.monitorMember(user);
        });

        connection.receiver.speaking.on('end', async (userId) => {
            const user = channel.members.get(userId);
            console.log(`User ${user?.displayName} stopped speaking`);
            const aiUser = getAIUser(userId);
            if (!aiUser.overtalked && aiUser.keywordFlagged) {
                let time1 = Date.now();
                console.log("Converting to text");
                const voiceSample = aiUser.getVoiceSample();
                let asText = await speechToText(voiceSample);
                let time2 = Date.now();
                console.log(`Speech to text took ${time2 - time1}ms`);
                console.log("Passing to assistant");
                /*
                let responseStream = await assistantStreaming([{
                    role: 'user',
                    content: asText
                }], userId);
                */
                let response = await assistantNonStreaming([{
                    role: 'user',
                    content: asText
                }], userId);
                let time3 = Date.now();
                console.log(`Assistant took ${time3 - time2}ms`);
                console.log("Converting to audio");
                // let responseTtsStream = await textToSpeechStreaming(responseStream);
                let responseAudio = await elevenlabs.textToSpeechStreaming(response) as ReadableStream;

                let time4 = Date.now();
                console.log(`Text to speech initialisation took ${time4 - time3}ms`);

                let audioPlayer = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause
                    }
                });
                connection.subscribe(audioPlayer);
                let reader = responseAudio.getReader();
                let readable = new Readable({
                    read() {
                        reader.read().then(({ done, value }) => {
                            if (done) {
                                this.push(null);
                            } else {
                                this.push(value);
                            }
                        });
                    }
                });

                readable.on('end', () => {
                    let time6 = Date.now();
                    console.log(`Audio generation comleted after ${time6 - time4}ms`);
                    console.log("Readable ended");
                });

                let resource = createAudioResource(readable);
                audioPlayer.play(resource);

                audioPlayer.on('error', (err) => {
                    console.log(`Audio player error: ${err}`);
                });
                audioPlayer.on('stateChange', (oldState, newState) => {
                    if (newState.status == 'idle') {
                        console.log("Audio player idle");
                        let time7 = Date.now();
                        console.log(`Audio playback took: ${time7 - time4}ms`);
                        console.log(`Total time: ${time7 - time1}ms`);
                    }
                });
            }
        });

        /*
        connection.receiver.onUdpMessage = (packet) => {
            console.log("udp packet:");
            console.log(packet);
        };
        */
    }

    private async monitorMember(member: GuildMember) {
        const userId = member.id;
        const connection = getVoiceConnection(member.guild.id);
        const aiUser = getAIUser(userId);
        const receiveStream = connection.receiver.subscribe(userId, {
            autoDestroy: true,
            emitClose: true
        });
        if (receiveStream.listenerCount('data') > 0) { return; }
        const opusDecoder = new prism.opus.Decoder({
            channels: 1,
            rate: DECODE_SAMPLE_RATE,
            frameSize: DECODE_FRAME_SIZE
        });
        pipeline(receiveStream, opusDecoder, (err) => {
            if (err) {
                console.log(`Opus decoding pipeline error: ${err}`);
            }
        });
        opusDecoder.on('error', (err) => {
            console.log(`Opus decoding error: ${err}`);
        });
        opusDecoder.on('close', () => {
            console.log(`Opus decoder for ${member?.displayName} closed`);
        });

        opusDecoder.on('data', (packet: Buffer) => {
            aiUser.addVoiceData(packet);
        });
        receiveStream.on('close', () => {
            console.log(`voice stream from ${member?.displayName} closed`);
        });
    }
}

