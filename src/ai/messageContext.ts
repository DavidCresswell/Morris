import settings from "../settings";

interface ContextPart {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface TimestampedContextPart {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

const contexts = new Map<string, TimestampedContextPart[]>();

let maxContextItems = settings.KEEP_LAST_N_INTERACTIONS;
let maxContextDuration = settings.KEEP_INTERACTION_DURATION;

export function getContextForUser(userId: string): ContextPart[] {
    if (!contexts.has(userId)) {
        contexts.set(userId, []);
    }
    const result = contexts.get(userId);
    const result2 = result.filter((part) => {
        return Date.now() - part.timestamp < maxContextDuration;
    });
    return result2.map((part) => {
        return {
            role: part.role,
            content: part.content
        };
    });
}

export function addContextForUser(userId: string, context: ContextPart[]) {
    if (!contexts.has(userId)) {
        contexts.set(userId, []);
    }
    let result = contexts.get(userId);
    result = result.filter((part) => {
        return Date.now() - part.timestamp < maxContextDuration;
    });
    result = result.concat(context.map((part) => {
        return {
            role: part.role,
            content: part.content,
            timestamp: Date.now()
        };
    }));
    if (result.length > maxContextItems) {
        result.splice(0, result.length - maxContextItems);
    }
    contexts.set(userId, result);
}