import { Readable } from "stream";
import * as elevenlabs from './services/texttospeech/elevenlabs';
import * as openai from './services/assistant/openai';
import * as porcupine from './services/wakeword/keyword_porcupine';
import { AudioMonitor } from "./audioMonitor";
import { addContextForUser, getContextForUser } from "./messageContext";
import { ContextPart, ResponseType } from "./types";
import * as aiServiceSelector from "./aiServiceSelector";
import settings from "../settings";

const aiChain = {
    /**
     * Listens on an audio stream and responds with an audio stream when wakeword is heard.
     */
    listenToSpokenAudio: function (userId: string, inputStream: Readable, callback: (responseAudioStream: Readable) => void, requestedResponseType?: ResponseType): void {
        if (requestedResponseType == null) requestedResponseType = ResponseType.RESPONSE_AUDIO;
        let monitor = new AudioMonitor(inputStream, 1000000, aiServiceSelector.getWakeWordService(), async (buffer) => {
            if (requestedResponseType == ResponseType.SPOKEN_AUDIO) {
                const readable = new Readable({
                    read() {
                        this.push(buffer);
                        this.push(null);
                    }
                });
                console.log("Responding to spoken audio with spoken audio");
                callback(readable);
            } else {
                console.log("Passing spoken audio to speech to next step");
                let responseStream = await aiChain.respondToSpokenAudio(userId, buffer, requestedResponseType);
                callback(responseStream);
            }
        });
    },
    /**
     * Responds to an audio stream
     */
    respondToSpokenAudio: async function (userId: string, inputBuffer: Buffer, requestedResponseType?: ResponseType): Promise<Readable> {
        console.log("Responding to spoken audio");
        if (requestedResponseType == null) requestedResponseType = ResponseType.RESPONSE_AUDIO;
        const sstService = aiServiceSelector.getSpeechToTextService();
        const text = await sstService(inputBuffer);
        if (requestedResponseType == ResponseType.SPOKEN_TEXT) {
            return Readable.from(text);
        } else {
            return await aiChain.respondToText(userId, text, requestedResponseType);
        }
    },
    /**
     * Responds to text
     */
    respondToText: async function (userId: string, input: string, requestedResponseType?: ResponseType): Promise<Readable> {
        console.log("Responding to text");
        if (requestedResponseType == null) requestedResponseType = ResponseType.RESPONSE_AUDIO;

        const context : ContextPart[] = [
            {
                role: 'system',
                content: settings.SYSTEM_PROMPT
            }
        ]
        context.push(...getContextForUser(userId));
        context.push({
            role: 'user',
            content: input
        });
        const assistantService = aiServiceSelector.getAssistantService();
        const response = await assistantService(context, userId);
        console.log("Got response from assistant");
        if (requestedResponseType == ResponseType.RESPONSE_TEXT) {
            return response;
        } else {
            return await aiChain.convertTextToSpeech(response);
        }
    },
    /**
     * Converts a text stream to speech
     */
    async convertTextToSpeech(inputStream: Readable): Promise<Readable> {
        console.log("Converting text to speech");
        const ttsService = aiServiceSelector.getTextToSpeechService();
        return await ttsService(inputStream);
    }
}

export default aiChain;
