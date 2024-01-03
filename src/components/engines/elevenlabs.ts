import { Readable, Stream } from "stream";
import settings from "../../settings";
import { ContextPart } from "../../contextPart";

export async function textToSpeechStreaming(text: string) {
    const body = {
        "model_id": settings.ELEVENLABS_MODEL_ID,
        "text": text,
        "voice_settings": {
            "similarity_boost": settings.ELEVENLABS_VOICE_SIMILARITY_BOOST,
            "stability": settings.ELEVENLABS_VOICE_STABILITY,
            "style": settings.ELEVENLABS_VOICE_STYLE,
            "use_speaker_boost": settings.ELEVENLABS_VOICE_USE_SPEAKER_BOOST
        }
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': settings.ELEVENLABS_XI_API_KEY
        },
        body: JSON.stringify(body)
    };
      
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${settings.ELEVENLABS_VOICE_ID}/stream?optimize_streaming_latency=${settings.ELEVENLABS_OPTIMIZE_STREAMING_LATENCY}&output_format=${settings.ELEVENLABS_OUTPUT_FORMAT}`, options);

    let status = response.status;
    if (status != 200) {
        console.log(`Received status ${status} from Eleven Labs API`);
        let errorBodyString = await response.text();
        throw new Error(`Received status ${status} from Eleven Labs API: ${errorBodyString}`);
    }

    return response.body as ReadableStream;
}

export function textToSpeechDualStreaming(inputStream: Stream) {
    throw new Error('Not implemented');
}

export async function listVoices() {
    let modelsResp = await fetch('https://api.elevenlabs.io/v1/voices', { method: 'GET', headers: { 'xi-api-key': settings.ELEVENLABS_XI_API_KEY } });
    let status = modelsResp.status;
    if (status != 200) {
        console.log(`Received status ${status} from Eleven Labs API`);
        let errorBodyString = await modelsResp.text();
        throw new Error(`Received status ${status} from Eleven Labs API: ${errorBodyString}`);
    }

    let models = await modelsResp.json();

    return models;
}

export async function listModels() {
    let modelsResp = await fetch('https://api.elevenlabs.io/v1/models', { method: 'GET', headers: { 'xi-api-key': settings.ELEVENLABS_XI_API_KEY } });
    let status = modelsResp.status;
    if (status != 200) {
        console.log(`Received status ${status} from Eleven Labs API`);
        let errorBodyString = await modelsResp.text();
        throw new Error(`Received status ${status} from Eleven Labs API: ${errorBodyString}`);
    }

    let models = await modelsResp.json();

    return models;
}
