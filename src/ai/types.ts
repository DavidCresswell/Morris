export interface KeywordDetector {
    detectKeyword: (input: Buffer) => boolean;
    dispose: () => void;
}

export enum ResponseType {
    /**
     * The original spoken audio from the user.
     */
    SPOKEN_AUDIO = 0,
    /**
     * The original spoken audio from the user, converted to text.
     */
    SPOKEN_TEXT = 1,
    /**
     * The response from the AI as text
     */
    RESPONSE_TEXT = 2,
    /**
     * The response from the AI as audio
     */
    RESPONSE_AUDIO = 3
}

export interface ContextPart {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
