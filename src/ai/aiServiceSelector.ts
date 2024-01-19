import settings from "../settings";
import * as openai_assistant from "./services/assistant/openai";
import * as cloudflare_assistant from "./services/assistant/cloudflare";
import * as openai_speechtotext from "./services/speechtotext/openai";
import * as cloudflare_speechtotext from "./services/speechtotext/cloudflare";
import * as elevenlabs from "./services/texttospeech/elevenlabs";
import * as porcupine from "./services/wakeword/keyword_porcupine";
import * as charactr from "./services/texttospeech/gemelo_charactr";

export function getWakeWordService() {
    switch (settings.WAKEWORD_SERVICE) {
        case "porcupine":
            return new porcupine.PorcupineKeywordDetector();
        default:
            throw new Error(`Unknown wakeword service ${settings.WAKEWORD_SERVICE}`);
    }
}

export function getAssistantService() {
    switch (settings.ASSISTANT_SERVICE) {
        case "openai":
            return openai_assistant.assistant;
        case "cloudflare":
            return cloudflare_assistant.assistant;
        default:
            throw new Error(`Unknown assistant service ${settings.ASSISTANT_SERVICE}`);
    }
}

export function getSpeechToTextService() {
    switch (settings.SPEECH_TO_TEXT_SERVICE) {
        case "openai":
            return openai_speechtotext.speechToText;
        case "cloudflare":
            return cloudflare_speechtotext.speechToText;
        default:
            throw new Error(`Unknown speech to text service ${settings.SPEECH_TO_TEXT_SERVICE}`);
    }
}

export function getTextToSpeechService() {
    switch (settings.TEXT_TO_SPEECH_SERVICE) {
        case "elevenlabs":
            return elevenlabs.textToSpeech;
        case "charactr":
            return charactr.textToSpeechSimplex;
        default:
            throw new Error(`Unknown text to speech service ${settings.TEXT_TO_SPEECH_SERVICE}`);
    }
}
