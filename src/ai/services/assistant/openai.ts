// OpenAI engine:
// - Speech to text
// - Assistant
// - Text to speech

import { PassThrough, Readable } from 'stream';
import settings from '../../../settings';

import parseAssistantStream from './parseAssistantStream';
import { ContextPart } from '../../types';

var apiKey = settings.OPENAI_KEY;
var model = settings.OPENAI_MODEL;

async function assistantBase(context: ContextPart[], userId: string, stream: boolean) {
    console.log(`Assistant context: ${JSON.stringify(context)}`);
    let systemMessage: ContextPart = {
        role: 'system',
        content: settings.SYSTEM_PROMPT
    };
    var messages: ContextPart[] = context.map((part) => {
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

async function assistantStreaming(context: ContextPart[], userId: string): Promise<Readable> {
    let stream = new PassThrough();
    let result = await assistantBase(context, userId, true);
    return parseAssistantStream(result);
}

async function assistantNonStreaming(context: ContextPart[], userId: string): Promise<Readable> {
    let result = await assistantBase(context, userId, false);
    let body = await result.json();
    console.log("Got response from assistant");
    console.log(body.choices[0].message.content);
    let stream = new PassThrough();
    stream.write(body.choices[0].message.content);
    stream.end();
    return stream;
}

export async function assistant(context: ContextPart[], userId: string): Promise<Readable> {
    if (settings.STREAM_ASSISTANT_TO_TTS) {
        return await assistantStreaming(context, userId);
    } else {
        return await assistantNonStreaming(context, userId);
    }
}