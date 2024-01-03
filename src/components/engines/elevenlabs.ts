import { PassThrough, Readable, Stream } from "stream";
import settings from "../../settings";
import { ContextPart } from "../../contextPart";
import { WebSocket } from "ws";

export async function textToSpeechStreaming(text: string): Promise<Readable> {
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
    
    let reader = response.body.getReader();
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

    return readable;
}

export function textToSpeechDualStreaming(inputStream: Readable): Readable {
    let startTime = Date.now();
    const ws = new WebSocket(`wss://api.elevenlabs.io/v1/text-to-speech/${settings.ELEVENLABS_VOICE_ID}/stream-input?model_id=${settings.ELEVENLABS_MODEL_ID}&optimize_streaming_latency=${settings.ELEVENLABS_OPTIMIZE_STREAMING_LATENCY}&output_format=${settings.ELEVENLABS_OUTPUT_FORMAT}`);
    let output = new PassThrough();
    ws.on('open', () => {
        console.log('WebSocket opened');
        let openTime = Date.now();
        console.log(`WebSocket initialisation took ${openTime - startTime}ms`);
        // send initial message
        ws.send(JSON.stringify({
            text: ' ',
            voice_settings: {
                similarity_boost: settings.ELEVENLABS_VOICE_SIMILARITY_BOOST,
                stability: settings.ELEVENLABS_VOICE_STABILITY,
                style: settings.ELEVENLABS_VOICE_STYLE,
                use_speaker_boost: settings.ELEVENLABS_VOICE_USE_SPEAKER_BOOST
            },
            xi_api_key: settings.ELEVENLABS_XI_API_KEY
        }));

        inputStream.on('data', (chunk: Buffer) => {
            let asString = chunk.toString();
            console.log(asString);
            let opts = {
                text: asString,
                try_trigger_generation: true
            };
            ws.send(JSON.stringify(opts));
        });
    });
    inputStream.on('end', () => {
        let eosOpts = {
            text: ''
        };
        ws.send(JSON.stringify(eosOpts));
    });
    ws.on('message', (data: string) => {
        let response = JSON.parse(data);
        if (response.audio) {
            let audioChunk = Buffer.from(response.audio, 'base64');
            console.log(`Received audio chunk of length ${audioChunk.length}`);
            output.write(audioChunk);
        } else {
            console.log("Received non-audio response from Eleven Labs API");
            console.log(response);
        }
        if (response.isFinal) {
            console.log("Received final response from Eleven Labs API");
            output.end();
        }
    });
    ws.on('close', (code, reason) => {
        console.log('WebSocket closed');
        if (code != 1000) {
            console.log(`WebSocket closed with code ${code} and reason ${reason}`);
        }
        output.end();
    });
    return output;
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
