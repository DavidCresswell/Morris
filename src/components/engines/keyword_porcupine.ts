// Keyword detection using Porcupine

import { Porcupine } from "@picovoice/porcupine-node";

var _porcupineKey: string;
var _wakewordPaths: string[];
var _sensitivities: number[];
var _detectionMap = new Map<string, KeywordDetectionDetails>();

export function setPorcupineParams(porcupineKey: string, wakewordPaths: string[], sensitivities: number[]) {
    _porcupineKey = porcupineKey;
    _wakewordPaths = wakewordPaths;
    _sensitivities = sensitivities;
}

// TODO dispose porcupine instances
function getKeywordDetectionDetails(userId: string) {
    var detectionDetails = _detectionMap.get(userId);
    if (detectionDetails === undefined) {
        var porcupine = new Porcupine(_porcupineKey, _wakewordPaths, _sensitivities);
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
