import { Porcupine } from '@picovoice/porcupine-node';
import { OpenAI } from 'openai';
import path from 'path';
import DiscordClient from './discordClient';
import dotenv from 'dotenv';
import { s } from '@sapphire/shapeshift';
import { listModels, listVoices, textToSpeechStreaming } from './components/engines/elevenlabs';

const discordClient = new DiscordClient();
