"use client";

import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { ChatMessage, ChatStatus } from "@/lib/hooks/use-simple-chat";
import { cn } from "@/lib/utils";
import { ArrowUpIcon, StopIcon } from "./icons";
import { Button } from "./ui/button";

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  messages,
  sendMessage,
  className,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: ChatStatus;
  stop: () => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();

      if (!input.trim() || status === "streaming") {
        return;
      }

      window.history.pushState({}, "", `/chat/${chatId}`);
      sendMessage(input);
      setInput("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
    [input, chatId, sendMessage, setInput, status]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);

      // Auto-resize textarea
      const textarea = event.target;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    },
    [setInput]
  );

  const isStreaming = status === "streaming";

  return (
    <div className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2">
        <div className="relative flex w-full items-end rounded-xl border border-input bg-background shadow-sm transition-colors focus-within:border-primary">
          <textarea
            ref={textareaRef}
            className="min-h-[56px] max-h-[200px] w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={
              messages.length === 0
                ? "Ask a question..."
                : "Send a message..."
            }
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
          />

          <div className="flex items-center gap-1 px-2 pb-2">
            {isStreaming ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={stop}
                className="h-8 w-8 rounded-lg"
              >
                <StopIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                className="h-8 w-8 rounded-lg"
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <div>
            {status === "streaming" && <span>Generating response...</span>}
            {status === "submitted" && <span>Sending...</span>}
          </div>
        </div>
      </form>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    return (
      prevProps.input === nextProps.input &&
      prevProps.status === nextProps.status &&
      prevProps.messages.length === nextProps.messages.length
    );
  }
);
