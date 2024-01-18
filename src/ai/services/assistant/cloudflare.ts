import { Readable } from 'stream';
import settings from '../../../settings';

import parseAssistantStream from './parseAssistantStream';
import { ContextPart } from '../../types';

export async function assistant(context: ContextPart[], userId: string): Promise<Readable> {
    let response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${settings.CLOUDFLARE_ACCOUNT_ID}/ai/run/${settings.CLOUDFLARE_MODEL_ID}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${settings.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "stream": true,
            "messages": context
        })
    });

    if (response.status != 200) {
        console.log(`Received status ${response.status} from Cloudflare API`);
        let errorBodyString = await response.text();
        throw new Error(`Received status ${response.status} from Cloudflare API: ${errorBodyString}`);
    }
    
    return parseAssistantStream(response);
}