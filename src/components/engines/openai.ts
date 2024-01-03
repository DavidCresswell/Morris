// OpenAI engine:
// - Speech to text
// - Assistant
// - Text to speech

import { OpenAI } from 'openai';
import { PassThrough, Readable } from 'stream';
import { writeFile } from 'fs';
import { ContextPart } from '../../contextPart';
import { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources';
import { Stream } from 'openai/streaming';
import settings from '../../settings';
import StreamValues from 'stream-json/streamers/StreamValues';
import { chain } from 'stream-chain';

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

async function assistantBase(context: ContextPart[], userId: string, stream: boolean) {
    console.log(`Assistant context: ${JSON.stringify(context)}`);
    let systemMessage: ContextPart = {
        role: 'system',
        content: `You are Morris. You must answer all questions succinctly, with a little humor. The date is ${new Date().toLocaleDateString()} and the time is ${new Date().toLocaleTimeString()}`
    };
    var messages: ChatCompletionMessageParam[] = context.map((part) => {
        return {
            role: part.role,
            content: part.content
        }
    });
    console.log("Sending completion request");
    /*
    var result = await openAI.chat.completions.create({
        model: model,
        messages: [systemMessage, ...messages],
        max_tokens: 75,
        stream: stream,
        user: userId
    });
    */
    let result = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: [systemMessage, ...messages],
            max_tokens: 75,
            stream: stream,
            user: userId
        })
    });
    console.log("Got completion response");

    if (result.status != 200) {
        console.log(`Received status ${result.status} from OpenAI API`);
        let errorBodyString = await result.text();
        throw new Error(`Received status ${result.status} from OpenAI API: ${errorBodyString}`);
    }
    return result;
}

export async function assistantStreaming(context: ContextPart[], userId: string): Promise<Readable> {
    let stream = new PassThrough();
    let result = await assistantBase(context, userId, true);
    let resultStream = result.body;
    let reader = resultStream.getReader();
    let readable = new Readable({
        read() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    this.push(null);
                } else {
                    let buffer = Buffer.from(value);
                    let string = buffer.toString();
                    let lines = string.split('\n');
                    lines = lines.map((line) => {
                        if (line.startsWith('data: ')) {
                            line = line.substring(6);
                        }
                        return line;
                    });
                    let newString = lines.join('\n');
                    let newValue = Buffer.from(newString);
                    this.push(newValue);
                }
            });
        }
    });
    readable.on('end', () => {
        console.log("assistant stream ended");
        stream.end();
    });

    const pipeline = chain([
        readable,
        StreamValues.withParser()
    ]);
    pipeline.on('data', (chunk) => {
        let value = chunk.value.choices[0].delta.content;
        //console.log(value);
        stream.push(Buffer.from(value));
    });
    return stream;
}

export async function assistantNonStreaming(context: ContextPart[], userId: string): Promise<Readable> {
    let result = await assistantBase(context, userId, false);
    let body = await result.json();
    console.log(body.choices[0].message.content);
    let stream = new PassThrough();
    stream.write(Buffer.from(body.choices[0].message.content));
    stream.end();
    return stream;
}