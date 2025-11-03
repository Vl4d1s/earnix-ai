import type { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";

// Stubbed for POC - no database persistence
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return empty history for POC
  return Response.json({
    chats: [],
    hasMore: false,
  });
}

export async function DELETE() {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No-op for POC
  return Response.json({ deletedCount: 0 }, { status: 200 });
}
