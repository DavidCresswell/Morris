export interface ContextPart {
    role: 'user' | 'assistant' | 'system';
    content: string;
}