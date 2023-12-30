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
    SENSITIVITY: '0.95',

    CHARACTR_API_KEY: '',
    CHARACTR_CLIENT_KEY: '',
    CHARACTR_VOICE: 'Owen'
};


dotenv.config();

// import from env
for (const key in settings) {
    if (process.env[key]) {
        settings[key] = process.env[key]!;
    }
}

export default settings;
