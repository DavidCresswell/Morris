import { ParsedEvent, createParser } from "eventsource-parser";
import { PassThrough } from "stream";

export default function parseAssistantStream(response: Response) {
    let stream = new PassThrough();
    let ended = false;
    let parser = createParser((event: ParsedEvent) => {
        if (ended) return;
        if (event.data != null) {
            if (event.data == "[DONE]") {
                console.log("Stream ended (c)");
                stream.end();
                ended = true;
            } else {
                const jsonData = JSON.parse(event.data);
                if (jsonData.response != null) {
                    // Cloudflare format
                    if (jsonData.response.length > 0) {
                        //console.log(".." + jsonData.response + "..");
                        stream.write(Buffer.from(jsonData.response));
                    }
                } else {
                    // OpenAI format
                    const messageSegment = jsonData.choices[0].delta.content;
                    if (messageSegment != null && messageSegment.length > 0) {
                        //console.log(".." + messageSegment + "..");
                        stream.write(Buffer.from(messageSegment));
                    }
                }
            }
        }
    });
    const eventStream = response.body
        .pipeThrough(new TextDecoderStream())

    const eventReader = eventStream.getReader();

    eventReader.read().then(function processMessage({ done, value }) {
        if (ended) {
            console.log("Stream ended (a)");
            return;
        }
        if (done) {
            console.log("Stream ended (b)");
            return;
        }
        parser.feed(value);
        eventReader.read().then(processMessage);
    });

    return stream;
}