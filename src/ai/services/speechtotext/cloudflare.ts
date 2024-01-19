import settings from "../../../settings";
import { getWavHeader } from "../../util";

export async function speechToText(buffer: Buffer) {
    const wavHeader = getWavHeader(buffer.length, 16000);
    let response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${settings.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/openai/whisper`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${settings.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'audio/wav',
            'Content-Length': `${wavHeader.length + buffer.length}`
        },
        body: Buffer.concat([wavHeader, buffer])
    });

    if (response.status != 200) {
        console.log(`Received status ${response.status} from Cloudflare whisper API`);
        let errorBodyString = await response.text();
        throw new Error(`Received status ${response.status} from Cloudflare whisper API: ${errorBodyString}`);
    }
    
    let body = await response.json();
    return body.result.text;
}
