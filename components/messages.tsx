import { memo, useEffect, useRef } from "react";
import type { ChatMessage, ChatStatus } from "@/lib/hooks/use-simple-chat";
import { Conversation, ConversationContent } from "./elements/conversation";
import { Greeting } from "./greeting";
import { PreviewMessage } from "./message";

type MessagesProps = {
  chatId: string;
  status: ChatStatus;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  regenerate: () => void;
  isReadonly: boolean;
  selectedModelId: string;
};

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId,
}: MessagesProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (status === "streaming" || status === "submitted") {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    }
  }, [status, messages.length]);

  return (
    <div
      className="overscroll-behavior-contain -webkit-overflow-scrolling-touch flex-1 touch-pan-y overflow-y-scroll"
      ref={messagesContainerRef}
      style={{ overflowAnchor: "none" }}
    >
      <Conversation className="mx-auto flex min-w-0 max-w-4xl flex-col gap-4 md:gap-6">
        <ConversationContent className="flex flex-col gap-4 px-2 py-4 md:gap-6 md:px-4">
          {messages.length === 0 && <Greeting />}

          {messages.map((message, index) => (
            <PreviewMessage
              chatId={chatId}
              isLoading={
                status === "streaming" && messages.length - 1 === index
              }
              isReadonly={isReadonly}
              key={message.id}
              message={message}
              regenerate={regenerate}
              selectedModelId={selectedModelId}
              setMessages={setMessages}
            />
          ))}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Thinking...
            </div>
          )}

          <div ref={messagesEndRef} />
        </ConversationContent>
      </Conversation>
    </div>
  );
}

export const Messages = memo(
  PureMessages,
  (prevProps, nextProps) => {
    // Allow re-renders during streaming for smooth updates
    if (prevProps.status === 'streaming' || nextProps.status === 'streaming') {
      return false; // Always re-render during streaming
    }

    // Otherwise, only re-render if messages actually changed
    return (
      prevProps.status === nextProps.status &&
      prevProps.messages.length === nextProps.messages.length &&
      prevProps.messages[prevProps.messages.length - 1]?.content ===
        nextProps.messages[nextProps.messages.length - 1]?.content
    );
  }
);
