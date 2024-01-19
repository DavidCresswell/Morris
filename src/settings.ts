import dotenv from 'dotenv';

interface Settings {
    PICOVOICE_KEY: string;
    DISCORD_API_TOKEN: string;

    WAKEWORD_SERVICE: 'porcupine';
    SPEECH_TO_TEXT_SERVICE: 'openai' | 'cloudflare';
    ASSISTANT_SERVICE: 'openai' | 'cloudflare';
    TEXT_TO_SPEECH_SERVICE: 'elevenlabs' | 'coqui' | 'charactr';

    STREAM_ASSISTANT_TO_TTS: boolean;
    STREAM_TTS_OUTPUT: boolean;

    WAKEWORD: string;
    SENSITIVITY: string;

    OPENAI_KEY: string;
    OPENAI_MODEL: string;
    OPENAI_WHISPER_PROMPT: string;

    CHARACTR_API_KEY: string;
    CHARACTR_CLIENT_KEY: string;
    CHARACTR_VOICE_ID: number;
    
    COQUI_TTS_ENDPOINT: string;
    COQUI_SPEAKER_ID: string;

    // https://elevenlabs.io/docs/api-reference/streaming
    ELEVENLABS_XI_API_KEY: string;
    ELEVENLABS_MODEL_ID: string;
    ELEVENLABS_VOICE_ID: string;
    ELEVENLABS_VOICE_STABILITY: number;
    ELEVENLABS_VOICE_SIMILARITY_BOOST: number;
    ELEVENLABS_VOICE_STYLE: number;
    ELEVENLABS_VOICE_USE_SPEAKER_BOOST: boolean;
    ELEVENLABS_OPTIMIZE_STREAMING_LATENCY: 0 | 1 | 2 | 3 | 4;
    ELEVENLABS_OUTPUT_FORMAT: 'mp3_44100_128' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_16000' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';

    // https://developers.cloudflare.com/workers-ai/get-started/rest-api/
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_API_TOKEN: string;
    CLOUDFLARE_MODEL_ID: string;

    KEEP_LAST_N_INTERACTIONS: number;
    KEEP_INTERACTION_DURATION: number;

    SYSTEM_PROMPT: string;
}

var platform : string = process.platform;
if (platform == 'win32') {
    platform = 'windows';
}

let settings: Settings = {
    PICOVOICE_KEY: '',
    DISCORD_API_TOKEN: '',

    WAKEWORD_SERVICE: 'porcupine',
    SPEECH_TO_TEXT_SERVICE: 'cloudflare',
    ASSISTANT_SERVICE: 'cloudflare',
    TEXT_TO_SPEECH_SERVICE: 'elevenlabs',

    STREAM_ASSISTANT_TO_TTS: false, // Usually streaming is faster, sometimes much slower, probably depending on openAI's service load
    STREAM_TTS_OUTPUT: false, // Sometimes this leads to stuttering / cut out audio if the service isn't fast enough to convert live audio (elevenlabs)

    OPENAI_KEY: '',
    OPENAI_MODEL: 'gpt-3.5-turbo-1106',
    OPENAI_WHISPER_PROMPT: 'Hello, Morris.',

    WAKEWORD: `Morris_en_${platform}_v3_0_0.ppn`,
    SENSITIVITY: '1',

    CHARACTR_API_KEY: '',
    CHARACTR_CLIENT_KEY: '',
    CHARACTR_VOICE_ID: 143, // Owen from their default voices

    COQUI_TTS_ENDPOINT: 'http://localhost:5002/api/tts',
    COQUI_SPEAKER_ID: '',

    ELEVENLABS_XI_API_KEY: '',
    ELEVENLABS_MODEL_ID: 'eleven_multilingual_v2',
    ELEVENLABS_VOICE_ID: '21m00Tcm4TlvDq8ikWAM', // "Rachel" from their default voices
    ELEVENLABS_VOICE_STABILITY: 0.5,
    ELEVENLABS_VOICE_SIMILARITY_BOOST: 0.9,
    ELEVENLABS_VOICE_STYLE: 0.66,
    ELEVENLABS_VOICE_USE_SPEAKER_BOOST: false,
    ELEVENLABS_OPTIMIZE_STREAMING_LATENCY: 4,
    ELEVENLABS_OUTPUT_FORMAT: 'pcm_16000',

    CLOUDFLARE_ACCOUNT_ID: '',
    CLOUDFLARE_API_TOKEN: '',
    // https://developers.cloudflare.com/workers-ai/models/text-generation/#available-embedding-models
    CLOUDFLARE_MODEL_ID: '@cf/mistral/mistral-7b-instruct-v0.1',

    KEEP_LAST_N_INTERACTIONS: 5,
    KEEP_INTERACTION_DURATION: 5 * 60 * 1000, // 5 minutes

    SYSTEM_PROMPT: 'You must answer all questions succinctly. Today is {{date}} and the time is {{time}}. Keep the response short.',
};


dotenv.config();

// import from env
for (const key in settings) {
    if (process.env[key]) {
        settings[key] = process.env[key]!;
    }
}

export default settings;
