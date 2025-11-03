"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatHeader } from "@/components/chat-header";
import { useSimpleChat } from "@/lib/hooks/use-simple-chat";
import type { ChatMessage } from "@/lib/hooks/use-simple-chat";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
import { toast } from "./toast";
import type { VisibilityType } from "./visibility-selector";

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialLastContext?: any;
}) {
  const [input, setInput] = useState<string>("");
  const [currentModelId, setCurrentModelId] = useState(initialChatModel);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    error,
    stop,
    regenerate,
  } = useSimpleChat({
    id,
    initialMessages,
    api: "/api/chat",
    onError: (error) => {
      toast({
        type: "error",
        description: error.message || "An error occurred",
      });
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage(query);
      setHasAppendedQuery(true);
      window.history.replaceState({}, "", `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  return (
    <div className="overscroll-behavior-contain flex h-dvh min-w-0 touch-pan-y flex-col bg-background">
      <ChatHeader
        chatId={id}
        isReadonly={isReadonly}
        selectedVisibilityType={initialVisibilityType}
      />

      <Messages
        chatId={id}
        isReadonly={isReadonly}
        messages={messages}
        regenerate={regenerate}
        selectedModelId={initialChatModel}
        setMessages={setMessages}
        status={status}
      />

      <div className="sticky bottom-0 z-1 mx-auto flex w-full max-w-4xl gap-2 border-t-0 bg-background px-2 pb-3 md:px-4 md:pb-4">
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            messages={messages}
            sendMessage={sendMessage}
            setInput={setInput}
            status={status}
            stop={stop}
          />
        )}
      </div>
    </div>
  );
}
