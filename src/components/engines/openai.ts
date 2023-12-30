// OpenAI engine:
// - Speech to text
// - Assistant
// - Text to speech

import { OpenAI } from 'openai';
import { PassThrough } from 'stream';
import { writeFile } from 'fs';
import { ContextPart } from '../../contextPart';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Stream } from 'openai/streaming';
import settings from '../../settings';

var apiKey = settings.OPENAI_KEY;
var model = settings.OPENAI_MODEL;

var openAI = new OpenAI({
    apiKey: apiKey
});

export async function speechToText(buffer: Buffer) {
    var wavHeader = Buffer.alloc(44);
    wavHeader.write('RIFF', 0);
    wavHeader.writeUInt32LE(36 + buffer.length, 4); // Length of entire file in bytes minus 8
    wavHeader.write('WAVE', 8);
    wavHeader.write('fmt ', 12);
    wavHeader.writeUInt32LE(16, 16); // Length of format data
    wavHeader.writeUInt16LE(1, 20); // Type of format (1 is PCM)
    wavHeader.writeUInt16LE(1, 22); // Number of channels
    wavHeader.writeUInt32LE(16000, 24); // Sample rate
    wavHeader.writeUInt32LE(32000, 28); // Byte rate
    wavHeader.writeUInt16LE(2, 32); // Block align ((BitsPerSample * Channels) / 8)
    wavHeader.writeUInt16LE(16, 34); // Bits per sample
    wavHeader.write('data', 36); // Data chunk header
    wavHeader.writeUInt32LE(buffer.length, 40); // Data chunk size

    const file = new File([wavHeader, buffer], 'audio.wav', { type: 'audio/wav' });

    // This actually returns a string instead of the expected Transcription object 🙃
    var result = await openAI.audio.transcriptions.create({
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
        prompt: 'Hello, Morris.',
        file: file
    }) as any as string;
    console.log(result);
    result = result.trim();
    console.log(`Speech to text: ${result}`);
    if (result == null || result.length < 5) {
        return null;
    }
    return result;
}

export async function assistantStreaming(context: ContextPart[], userId: string) {
    let duplexStream = new PassThrough();
    console.log(`Assistant context: ${JSON.stringify(context)}`);
    var messages: ChatCompletionMessageParam[] = context.map((part) => {
        return {
            role: part.role,
            content: part.content
        }
    });
    console.log("Awaiting completion");
    var result = await openAI.chat.completions.create({
        model: model,
        messages: messages,
        max_tokens: 75, // 128
        stream: true,
        user: userId
    });
    console.log("Got completion stream");
    (async function () {
        for await (const message of result) {
            console.log(message);
            duplexStream.write(message.choices[0].delta.content);
        }
    });
    return duplexStream;
}

export async function assistantNonStreaming(context: ContextPart[], userId: string) {
    console.log(`Assistant context: ${JSON.stringify(context)}`);
    let systemMessage : ContextPart = {
        role: 'system',
        content: `You are Morris, answer in only a couple of sentences. You must answer all questions. The date is ${new Date().toLocaleDateString()} and the time is ${new Date().toLocaleTimeString()}`
    };
    var messages: ChatCompletionMessageParam[] = context.map((part) => {
        return {
            role: part.role,
            content: part.content
        }
    });
    console.log("Awaiting completion");
    var result = await openAI.chat.completions.create({
        model: model,
        messages: [systemMessage, ...messages],
        max_tokens: 12, // 128
        stream: false,
        user: userId
    });
    console.log("Got completion");
    console.log(result.choices[0].message.content);
    return result.choices[0].message.content;
}