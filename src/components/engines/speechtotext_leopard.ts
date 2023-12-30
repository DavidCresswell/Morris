import { Leopard } from "@picovoice/leopard-node";

var leopard : Leopard;

export function setLeopardParams(accessKey: string) {
    leopard = new Leopard(accessKey);
}

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
