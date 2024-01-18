import { Leopard } from "@picovoice/leopard-node";
import settings from "../../../settings";

const leopard = new Leopard(settings.PICOVOICE_KEY);

export function speechToText(buffer: Buffer) {
    const result = leopard.process(new Int16Array(buffer));
    console.log(`Speech to text: ${result.transcript}`);
    console.log("Words:");
    console.log(result.words);
    if (result.transcript?.length < 5) {
        return null;
    }
    return result.transcript;
}
