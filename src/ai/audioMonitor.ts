import { PassThrough, Readable } from "stream";
import { KeywordDetector } from "./types";

// Buffers all audio
export class AudioMonitor {
    private readable: Readable;
    private buffers: Buffer[] = [];
    private maxSize: number;
    private lastFlagged: number = -1;
    private ended: boolean = false;
    private keywordDetector: KeywordDetector;

    constructor(readable: Readable, maxSize: number, keywordDetector: KeywordDetector, callback: (buffer: Buffer) => void) {
        console.log('AudioMonitor created');
        this.readable = readable;
        this.maxSize = maxSize;
        this.keywordDetector = keywordDetector;
        this.readable.on('data', (chunk: Buffer) => {
            //console.log('AudioMonitor got data');
            if (keywordDetector.detectKeyword(chunk)) {
                this.lastFlagged = this.buffers.length;
            }
            this.buffers.push(chunk);
            const currentSize = this.buffers.reduce((acc, cur) => acc + cur.length, 0);
            while (currentSize > this.maxSize) {
                this.buffers.shift();
                this.lastFlagged--;
            }
        });
        this.readable.on('end', () => {
            console.log('AudioMonitor ended');
            this.ended = true;
            if (this.lastFlagged < 0) return;
            callback(this.getBufferFromStart());
            this.keywordDetector.dispose();
        });
        this.readable.on('speakingStopped', () => {
            if (this.ended) return;
            console.log('Speaking stopped');
            if (this.lastFlagged < 0) return;
            callback(this.getBufferFromStart());
        });
        this.readable.on('speakingStarted', () => {
            if (this.ended) return;
            console.log('Speaking started');
            this.reset();
        });
    }

    isFlagged() {
        return this.lastFlagged >= 0;
    }

    getBufferFromFlag() {
        if (this.lastFlagged < 0) {
            return null;
        }
        const buffer = Buffer.concat(this.buffers.slice(this.lastFlagged));
        return buffer;
    }

    getBufferFromStart() {
        const buffer = Buffer.concat(this.buffers);
        return buffer;
    }

    reset() {
        this.buffers = [];
        this.lastFlagged = -1;
    }

    isEnded() {
        return this.ended;
    }
}