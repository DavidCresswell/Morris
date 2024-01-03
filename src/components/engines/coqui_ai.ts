// https://github.com/coqui-ai/TTS
// https://docs.coqui.ai/en/latest/docker_images.html#start-a-server

import settings from "../../settings";

var coquiServer = settings.COQUI_TTS_ENDPOINT;
var coquiSpeakerId = settings.COQUI_SPEAKER_ID;

async function textToSpeech(text: string) {
    var query = `?text=${encodeURIComponent(text)}&speaker_id=${coquiSpeakerId}&style_wav=&language_id=`;

    var response = await fetch(coquiServer + query);
    return response.body;
}
