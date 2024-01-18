import { Readable } from "stream";
import aiChain from "./ai/aiChain";
import { ResponseType } from "./ai/types";
import DiscordClient from "./discordClient";
import * as fs from 'fs';
import * as elevenlabs from "./ai/services/texttospeech/elevenlabs";
import * as charactr from "./ai/services/texttospeech/gemelo_charactr";
import * as cloudflare from "./ai/services/assistant/cloudflare";
import settings from "./settings";


const discordClient = new DiscordClient();

discordClient.on('userStream', (userId, audioStream) => {

    aiChain.listenToSpokenAudio(userId, audioStream, async (responseAudioStream) => {
        console.log("Got response audio stream");
        responseAudioStream.on('close', () => {
            console.log("Response audio stream closed"); 
        });
        await discordClient.playAudioStream(userId, responseAudioStream);
    }, ResponseType.RESPONSE_AUDIO);
});
