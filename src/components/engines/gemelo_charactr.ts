import { CharactrAPISDK } from '@charactr/api-sdk';
import { PassThrough } from 'stream';
import settings from '../../settings';

export async function textToSpeechStreaming(textStream: PassThrough) {
    const stream = new PassThrough();
    var api = new CharactrAPISDK({
        ClientKey: settings.CHARACTR_CLIENT_KEY,
        APIKey: settings.CHARACTR_API_KEY
    });
    console.log("Initializing Charactr API");
    await api.init();
    let voiceId = -1;
    console.log("Getting voices");
    let voices = await api.tts.getVoices();
    for (let voice of voices) {
        if (voice.name == settings.CHARACTR_VOICE) {
            voiceId = voice.id;
            break;
        }
    }
    console.log(`Voice ${settings.CHARACTR_VOICE} has id ${voiceId}`);
    if (voiceId == -1) {
        console.error(`Voice ${settings.CHARACTR_VOICE} not found`);
        return;
    }
    console.log("Converting text to speech");
    var ttsStreamer = await api.tts.convertStreamDuplex(voiceId, {
        onData: function(data) {
            stream.write(data);
        },
        onClose: () => {
            stream.end();
        }
    }, {
        sampleRate: 48000,
        //format: 'pcm',
    });
    console.log("Starting async text stream");
    textStream.on('data', (data: string) => {
        ttsStreamer.convert(data);
    });
    textStream.on('end', () => {
        ttsStreamer.close();
    });
    textStream.on('error', (err) => {
        console.error(`Text stream error: ${err}`);
    });
    console.log("Returning stream");
    return stream;
}

export async function textToSpeechNonStreaming(text: string) {
    const stream = new PassThrough();
    var api = new CharactrAPISDK({
        ClientKey: settings.CHARACTR_CLIENT_KEY,
        APIKey: settings.CHARACTR_API_KEY
    });
    console.log("Initializing Charactr API");
    await api.init();
    let voiceId = -1;
    console.log("Getting voices");
    let voices = await api.tts.getVoices();
    for (let voice of voices) {
        if (voice.name == settings.CHARACTR_VOICE) {
            voiceId = voice.id;
            break;
        }
    }
    console.log(`Voice ${settings.CHARACTR_VOICE} has id ${voiceId}`);
    if (voiceId == -1) {
        console.error(`Voice ${settings.CHARACTR_VOICE} not found`);
        return;
    }
    console.log("Converting text to speech");
    var resp = await api.tts.convert(voiceId, text);
    let content = await resp.audio.arrayBuffer();
    let buffer = Buffer.from(content);
    return buffer;
}