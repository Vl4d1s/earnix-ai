'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateUUID } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

interface UseSimpleChatOptions {
  id?: string;
  initialMessages?: ChatMessage[];
  api?: string;
  onError?: (error: Error) => void;
  onFinish?: () => void;
}

export function useSimpleChat({
  id,
  initialMessages = [],
  api = '/api/chat',
  onError,
  onFinish,
}: UseSimpleChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentAssistantMessageRef = useRef<string>('');

  // Cleanup function for EventSource
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || status === 'streaming') {
        return;
      }

      // Create user message
      const userMessage: ChatMessage = {
        id: generateUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      // Add user message to UI
      setMessages((prev) => [...prev, userMessage]);
      setStatus('submitted');
      setError(null);

      // Create placeholder for assistant message
      const assistantMessageId = generateUUID();
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      currentAssistantMessageRef.current = '';

      try {
        setStatus('streaming');

        // Build conversation history INCLUDING the current user message
        // Note: messages state is stale here, so we must explicitly add the current message
        const conversationHistory = [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: content.trim(),
          }
        ];

        // Make POST request to start streaming
        const requestBody = {
          message: content.trim(),
          conversationHistory,
        };

        console.log('Sending to API:', requestBody);

        abortControllerRef.current = new AbortController();
        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: abortControllerRef.current.signal,
        });
        console.log('Response:', response);

        console.log('Response status:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Set up EventSource-like reading from response body
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages (separated by double newline)
          const messages = buffer.split('\n\n');
          buffer = messages.pop() || ''; // Keep incomplete message in buffer

          for (const message of messages) {
            if (!message.trim()) continue;

            // Parse SSE format: "event: xyz\ndata: {...}"
            const lines = message.split('\n');
            let dataLine = '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                dataLine = line.slice(6); // Remove "data: " prefix
                break;
              }
            }

            if (dataLine) {
              try {
                // Handle literal [DONE] string
                if (dataLine === '[DONE]') {
                  setStatus('ready');
                  onFinish?.();
                  continue;
                }

                const data = JSON.parse(dataLine);

                // Handle OpenAI-compatible format
                if (data.choices && data.choices.length > 0) {
                  const choice = data.choices[0];

                  // Check for completion
                  if (choice.finish_reason === 'stop' || choice.finish_reason === 'length') {
                    setStatus('ready');
                    onFinish?.();
                    continue;
                  }

                  // Extract content from delta
                  if (choice.delta && choice.delta.content) {
                    currentAssistantMessageRef.current += choice.delta.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              content: currentAssistantMessageRef.current,
                            }
                          : msg
                      )
                    );
                  }
                }
                // Fallback to custom format for backward compatibility
                else if (data.type === 'content') {
                  // Update assistant message with new content
                  currentAssistantMessageRef.current += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content: currentAssistantMessageRef.current,
                          }
                        : msg
                    )
                  );
                } else if (data.type === 'done') {
                  // Streaming complete
                  setStatus('ready');
                  onFinish?.();
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Unknown error');
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError, 'Line:', dataLine);
              }
            }
          }
        }

        setStatus('ready');
        onFinish?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');

        // Don't treat abort as an error
        if (error.name !== 'AbortError') {
          setError(error);
          setStatus('error');
          onError?.(error);

          // Remove the incomplete assistant message
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== assistantMessageId)
          );
        }
      } finally {
        cleanup();
      }
    },
    [messages, status, api, onError, onFinish, cleanup]
  );

  const stop = useCallback(() => {
    cleanup();
    setStatus('ready');
  }, [cleanup]);

  const regenerate = useCallback(() => {
    // Remove last assistant message and resend last user message
    setMessages((prev) => {
      const lastUserIndex = prev.findLastIndex((msg) => msg.role === 'user');
      if (lastUserIndex === -1) return prev;

      const lastUserMessage = prev[lastUserIndex];
      const newMessages = prev.slice(0, lastUserIndex);

      // Re-send the message
      setTimeout(() => {
        sendMessage(lastUserMessage.content);
      }, 0);

      return newMessages;
    });
  }, [sendMessage]);

  return {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    stop,
    regenerate,
  };
}
