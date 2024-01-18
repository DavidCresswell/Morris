// Keyword detection using Porcupine

import { Porcupine } from "@picovoice/porcupine-node";
import path from "path";
import settings from "../../../settings";
import { KeywordDetector } from "../../types";
import { Readable } from "stream";

var porcupineKey = settings.PICOVOICE_KEY;
const wakewordPath = path.resolve('wakeword', settings.WAKEWORD);
var sensitivity = parseFloat(settings.SENSITIVITY);
var _detectionMap = new Map<string, KeywordDetectionDetails>();

// TODO dispose porcupine instances
function getKeywordDetectionDetails(userId: string) {
    var detectionDetails = _detectionMap.get(userId);
    if (detectionDetails === undefined) {
        var porcupine = new Porcupine(porcupineKey, [wakewordPath], [sensitivity]);
        detectionDetails = {
            porcupine: porcupine,
            porcupineBuffer: Buffer.alloc(porcupine.frameLength * 2),
            porcupineBufferIndex: 0   
        };
    }
    return detectionDetails;
}

export function checkKeyword(userId: string, buffer: Buffer) {
    const detectionDetails = getKeywordDetectionDetails(userId);
    var fromBufferIx = 0;
    while (fromBufferIx < buffer.length) {
        const toBufferIx = Math.min(buffer.length, fromBufferIx + detectionDetails.porcupineBuffer.length - detectionDetails.porcupineBufferIndex);
        buffer.copy(detectionDetails.porcupineBuffer, detectionDetails.porcupineBufferIndex, fromBufferIx, toBufferIx);
        detectionDetails.porcupineBufferIndex += toBufferIx - fromBufferIx;
        fromBufferIx = toBufferIx;
        if (detectionDetails.porcupineBufferIndex >= detectionDetails.porcupineBuffer.length) {
            detectionDetails.porcupineBufferIndex = 0;
            const sampleIndex = detectionDetails.porcupine.process(new Int16Array(detectionDetails.porcupineBuffer.buffer));
            if (sampleIndex != -1) {
                console.log(`Keyword detected from ${userId}!`);
                return true;
            }
        }
    }
    _detectionMap.set(userId, detectionDetails);
    return false;
}

export function resetKeywordDetection(userId: string) {
    const detectionDetails = getKeywordDetectionDetails(userId);
    detectionDetails.porcupineBufferIndex = 0;
}

interface KeywordDetectionDetails {
    porcupine: Porcupine;
    porcupineBuffer: Buffer;
    porcupineBufferIndex: number;
}

export class PorcupineKeywordDetector implements KeywordDetector {
    private porcupine: Porcupine;
    private porcupineBuffer: Buffer;
    private porcupineBufferIndex: number;
    constructor() {
        this.porcupine = new Porcupine(porcupineKey, [wakewordPath], [sensitivity]);
        this.porcupineBuffer = Buffer.alloc(this.porcupine.frameLength * 2);
        this.porcupineBufferIndex = 0;
    }
    detectKeyword(input: Buffer) {
        var fromBufferIx = 0;
        while (fromBufferIx < input.length) {
            const toBufferIx = Math.min(input.length, fromBufferIx + this.porcupineBuffer.length - this.porcupineBufferIndex);
            input.copy(this.porcupineBuffer, this.porcupineBufferIndex, fromBufferIx, toBufferIx);
            this.porcupineBufferIndex += toBufferIx - fromBufferIx;
            fromBufferIx = toBufferIx;
            if (this.porcupineBufferIndex >= this.porcupineBuffer.length) {
                this.porcupineBufferIndex = 0;
                const sampleIndex = this.porcupine.process(new Int16Array(this.porcupineBuffer.buffer));
                if (sampleIndex != -1) {
                    console.log(`Keyword detected!`);
                    return true;
                }
            }
        }
        return false;
    }
    dispose() {
        this.porcupine.release();
    }
}
