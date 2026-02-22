import { useState, useCallback } from 'react';
import { useStore } from '../store/useStore';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

/**
 * useAIAgent hook
 * Manages the conversational state with "Mr. AI Agent".
 * Implements a Socratic dialogue pattern where the agent reflects and asks deepening questions.
 */
export function useAIAgent() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Welcome to the Sanctuary. I am here to reflect with you on your journey. What is on your mind today?',
            timestamp: Date.now(),
        },
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const userRole = useStore((state) => state.userRole);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsThinking(true);

        // Simulate AI Response Delay
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: generateResponse(content, userRole),
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            setIsThinking(false);
        }, 1500);
    }, [userRole]);

    const clearHistory = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        isThinking,
        sendMessage,
        clearHistory,
    };
}

/**
 * Socratic Response Generator (Mock for Alpha)
 * In production, this will call the actual LLM endpoint.
 */
function generateResponse(input: string, role: string | null): string {
    const reflections = [
        "That is an interesting perspective. Why do you feel that is the core of the issue?",
        "I hear you. If we look at this through the lens of growth, what becomes possible?",
        "The path of a teacher is often complex. How can we simplify this for your students?",
        "Reflection is the first step toward transformation. What else do you see in this situation?",
        "That sounds significant. How does this align with your deeper values?"
    ];

    // Simple keyword matching for a more "aware" feel
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('lesson') || lowerInput.includes('class')) {
        return "Lessons are more than just delivery; they are shared experiences. How was the energy in the room?";
    }
    if (lowerInput.includes('tired') || lowerInput.includes('stress')) {
        return "Rest is not a luxury; it is a vital part of the cycle. How can you find a moment of stillness today?";
    }
    if (lowerInput.includes('student')) {
        return "Each student is a world unto themselves. What did one of them teach you today?";
    }

    return reflections[Math.floor(Math.random() * reflections.length)] || '';
}
