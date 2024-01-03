import dotenv from 'dotenv';

interface Settings {
    PICOVOICE_KEY: string;
    OPENAI_KEY: string;
    DISCORD_API_TOKEN: string;
    GEMELO_API_KEY: string;

    OPENAI_MODEL: string;
    WAKEWORD: string;
    SENSITIVITY: string;

    CHARACTR_API_KEY: string;
    CHARACTR_CLIENT_KEY: string;
    CHARACTR_VOICE: string;
    
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
    ELEVENLABS_OUTPUT_FORMAT: 'mp3_44100_128' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192' | 'pcm_22050' | 'pcm_24000' | 'pcm_44100' | 'ulaw_8000';
}

var platform : string = process.platform;
if (platform == 'win32') {
    platform = 'windows';
}

let settings: Settings = {
    PICOVOICE_KEY: '',
    OPENAI_KEY: '',
    DISCORD_API_TOKEN: '',
    GEMELO_API_KEY: '',

    OPENAI_MODEL: 'gpt-3.5-turbo-1106',
    WAKEWORD: `Morris_en_${platform}_v3_0_0.ppn`,
    SENSITIVITY: '1',

    CHARACTR_API_KEY: '',
    CHARACTR_CLIENT_KEY: '',
    CHARACTR_VOICE: 'Owen',

    COQUI_TTS_ENDPOINT: 'http://localhost:5002/api/tts',
    COQUI_SPEAKER_ID: '',

    ELEVENLABS_XI_API_KEY: '',
    ELEVENLABS_MODEL_ID: 'eleven_multilingual_v2',
    ELEVENLABS_VOICE_ID: '21m00Tcm4TlvDq8ikWAM', // "Rachel" from their default voices
    ELEVENLABS_VOICE_STABILITY: 0.5,
    ELEVENLABS_VOICE_SIMILARITY_BOOST: 0.9,
    ELEVENLABS_VOICE_STYLE: 0.66,
    ELEVENLABS_VOICE_USE_SPEAKER_BOOST: true,
    ELEVENLABS_OPTIMIZE_STREAMING_LATENCY: 4,
    ELEVENLABS_OUTPUT_FORMAT: 'mp3_44100_128'
};


dotenv.config();

// import from env
for (const key in settings) {
    if (process.env[key]) {
        settings[key] = process.env[key]!;
    }
}

export default settings;
