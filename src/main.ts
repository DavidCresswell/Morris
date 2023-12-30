import { Porcupine } from '@picovoice/porcupine-node';
import { OpenAI } from 'openai';
import path from 'path';
import DiscordClient from './discordClient';
import dotenv from 'dotenv';
import { setPorcupineParams } from './components/engines/keyword_porcupine';
import { setLeopardParams } from './components/engines/speechtotext_leopard';
import { s } from '@sapphire/shapeshift';
import { setOpenAIParams } from './components/engines/openai';

dotenv.config();

var platform : string = process.platform;
if (platform == 'win32') {
    platform = 'windows';
}

const defaultOpenAIModel = 'gpt-3.5-turbo-1106';
const defaultWakeword = `Morris_en_${platform}_v3_0_0.ppn`;
const defaultSensitivity = '0.85';

// Required environment variables
const picoVoiceKey = process.env.PICOVOICE_KEY;
const openAIKey = process.env.OPENAI_KEY;
const discordAPIToken = process.env.DISCORD_API_TOKEN;

// Optional environment variables
const openAIModel = process.env.OPENAI_MODEL || defaultOpenAIModel;
const wakeword = process.env.WAKEWORD || defaultWakeword;
const wakewordPath = path.resolve('wakeword', wakeword);
const sensitivity = parseFloat(process.env.SENSITIVITY || defaultSensitivity);

setPorcupineParams(picoVoiceKey, [wakewordPath], [sensitivity]);
// setLeopardParams(picoVoiceKey);
setOpenAIParams(openAIKey, openAIModel);


const discordClient = new DiscordClient(discordAPIToken);

