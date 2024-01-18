import OpenAI from "openai";
import settings from "../../../settings";

var openAI = new OpenAI({
    apiKey: settings.OPENAI_KEY
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
        prompt: settings.OPENAI_WHISPER_PROMPT,
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
