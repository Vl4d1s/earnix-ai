"use server";

import { cookies } from "next/headers";
import type { VisibilityType } from "@/components/visibility-selector";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisibilityById,
} from "@/lib/db/queries";

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set("chat-model", model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: any;
}) {
  // Title generation removed for simplified POC
  // Return a simple timestamp-based title
  return "Chat " + new Date().toLocaleDateString();
}

export async function deleteTrailingMessages({
  id,
}: {
  id: string;
}) {
  const [message] = await getMessageById({ id });

  if (!message) {
    return {
      type: "error" as const,
      error: "Message not found",
    };
  }

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });

  return {
    type: "success" as const,
  };
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
