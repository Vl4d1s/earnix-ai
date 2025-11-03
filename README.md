# AI Chatbot - Stateless POC

A clean, simplified chatbot POC built with Next.js and the AI SDK. No databases, no user accounts, just chat.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

Get your API key at: https://platform.openai.com/api-keys

```
OPENAI_API_KEY=sk-...
```

### 3. Run the App

```bash
npm run dev
```

Your chatbot is now running at [http://localhost:3000](http://localhost:3000)

## What's Been Simplified

This is a stateless proof-of-concept version with:

✅ **Included:**
- Real AI streaming responses with OpenAI (GPT-4o)
- Clean chat interface

❌ **Removed:**
- Database (Postgres/Redis) - no persistence needed
- User authentication - no login/accounts
- Chat history - messages only in browser memory
- File uploads - no image attachments
- Document creation tools
- Rate limiting

## Features

- [Next.js](https://nextjs.org) App Router
- [AI SDK](https://ai-sdk.dev/docs/introduction) for streaming chat responses
- [shadcn/ui](https://ui.shadcn.com) components
- [Tailwind CSS](https://tailwindcss.com) styling

## Notes

- Messages are stored in browser memory only and disappear on page refresh
- UI components (sidebar, user menu, etc.) are still present but won't function without backend services
- Perfect for testing AI models or building a demo

## Original Version

This is a simplified fork. For the full-featured version with persistence, auth, and more, see the original repository.
