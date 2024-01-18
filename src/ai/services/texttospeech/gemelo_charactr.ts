import { PassThrough, Readable } from 'stream';
import settings from '../../../settings';
import { WebSocket } from "ws";
import { readableToString } from '../../util';

const httpEndpoint = 'https://api.gemelo.ai/v1';
const wsEndpoint = 'wss://api.gemelo.ai/v1';

export async function textToSpeechSimplex(textStream: Readable): Promise<Readable> {
    console.log("textToSpeechSimplex");
    // read all text from textStream
    let text = await readableToString(textStream);
    console.log("Text to speech simplex");
    console.log(text);
    return await new Promise((resolve, reject) => {
        console.log("gemelo: Creating websocket");
        var ws = new WebSocket(wsEndpoint + '/tts/stream/simplex/ws?voiceId=' + settings.CHARACTR_VOICE_ID);
        ws.onopen = function () {
            console.log("gemelo: Got open");
            ws.send(JSON.stringify({
                type: 'authApiKey',
                clientKey: settings.CHARACTR_CLIENT_KEY,
                apiKey: settings.CHARACTR_API_KEY
            }));
            ws.send(JSON.stringify({
                type: 'convert',
                text: text
            }));
            var passThrough = new PassThrough();
            ws.on('message', function (data: Buffer) {
                console.log("gemelo: Got message length " + data.length);
                passThrough.write(data);
            });
            ws.on('close', function () {
                console.log("gemelo:  Got close");
                passThrough.end();
            });
            resolve(passThrough);
        };
        ws.onerror = function (error) {
            console.log("gemelo:  Got error");
            console.error(error);
            reject(error);
        }
    });
}

export function textToSpeechDuplex(textStream: Readable): Promise<Readable> {
    return new Promise((resolve, reject) => {
        var ws = new WebSocket(wsEndpoint + '/tts/stream/duplex/ws?voiceId=' + settings.CHARACTR_VOICE_ID);
        ws.onopen = function () {
            ws.send(JSON.stringify({
                type: 'authApiKey',
                clientKey: settings.CHARACTR_CLIENT_KEY,
                apiKey: settings.CHARACTR_API_KEY
            }));
            textStream.on('data', function (data) {
                ws.send(JSON.stringify({
                    type: 'convert',
                    text: data.toString()
                }));
            });
            textStream.on('end', function () {
                ws.send(JSON.stringify({
                    type: 'close'
                }));
            });
            var passThrough = new PassThrough();
            ws.on('message', function (data) {
                passThrough.write(data);
            });
            ws.on('close', function () {
                passThrough.end();
            });
            resolve(passThrough);
        };
        ws.onerror = function (error) {
            reject(error);
        }
    });
}

