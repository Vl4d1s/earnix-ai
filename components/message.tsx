"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import type { ChatMessage } from "@/lib/hooks/use-simple-chat";
import { cn } from "@/lib/utils";
import { Response } from "./elements/response";
import { SparklesIcon, UserIcon } from "./icons";

const PurePreviewMessage = ({
  chatId,
  message,
  isLoading,
  setMessages,
  regenerate,
  isReadonly,
  selectedModelId,
}: {
  chatId: string;
  message: ChatMessage;
  isLoading: boolean;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  regenerate: () => void;
  isReadonly: boolean;
  selectedModelId: string;
}) => {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="group/message w-full"
      data-role={message.role}
      data-testid={`message-${message.role}`}
      initial={{ opacity: 0 }}
    >
      <div
        className={cn("flex w-full items-start gap-2 md:gap-3", {
          "justify-end": message.role === "user",
          "justify-start": message.role === "assistant",
        })}
      >
        {message.role === "assistant" && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div
          className={cn("flex flex-col gap-2", {
            "w-full": message.role === "assistant",
            "max-w-[calc(100%-2.5rem)] sm:max-w-[min(fit-content,80%)]":
              message.role === "user",
          })}
        >
          {message.role === "user" ? (
            <div className="rounded-xl bg-muted px-4 py-2.5">
              <div className="whitespace-pre-wrap break-words text-sm">
                {message.content}
              </div>
            </div>
          ) : (
            <div className="w-full">
              {message.content ? (
                <Response>{message.content}</Response>
              ) : isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Generating...
                </div>
              ) : null}
            </div>
          )}
        </div>

        {message.role === "user" && (
          <div className="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border">
            <UserIcon size={14} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.message.role === "assistant") {
      return (
        prevProps.message.content === nextProps.message.content &&
        prevProps.isLoading === nextProps.isLoading
      );
    }

    return true;
  }
);

export const ThinkingMessage = () => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    Thinking...
  </div>
);
