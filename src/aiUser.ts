import { checkKeyword } from "./components/engines/keyword_porcupine";

const users: Map<string, AIUser> = new Map<string, AIUser>();

export default class AIUser {
    userId: string;
    voiceBuffer: Buffer;
    voiceBufferIndex = 0;
    keywordFlagged = false;
    overtalked = false;

    constructor(name: string) {
        this.userId = name;
        // In future we should save memory by only having this allocated while the user is speaking
        this.voiceBuffer = Buffer.alloc(1024 * 1024); // 1MiB
    }

    addVoiceData(data: Buffer) {
        if (this.overtalked) return;
        data.copy(this.voiceBuffer, this.voiceBufferIndex);
        this.voiceBufferIndex += data.length;
        if (this.voiceBufferIndex >= this.voiceBuffer.length) {
            this.overtalked = true;
            this.keywordFlagged = false;
            console.log(`User ${this.userId} overtalked`);
            return;
        }
        if (checkKeyword(this.userId, data)) {
            this.keywordFlagged = true;
        }
    }

    start() {
        this.voiceBufferIndex = 0;
        this.keywordFlagged = false;
        this.overtalked = false;
    }

    getVoiceSample() {
        return this.voiceBuffer.subarray(0, this.voiceBufferIndex);
    }
}

export function getAIUser(userId: string) {
    var aiUser = users.get(userId);
    if (aiUser === undefined) {
        aiUser = new AIUser(userId);
        users.set(userId, aiUser);
    }
    return aiUser;
}
