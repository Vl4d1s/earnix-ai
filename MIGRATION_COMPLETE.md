# Flask Backend Migration - Complete ✅

## Summary

Successfully migrated the AI chatbot from Vercel AI SDK to a custom Flask backend with Server-Sent Events (SSE) streaming.

## What Was Done

### 1. Flask Server (`flask_server/`)
- ✅ Created `app.py` with SSE streaming endpoint
- ✅ Integrated OpenAI API with real-time streaming
- ✅ Added CORS support for local development
- ✅ Created `requirements.txt` with dependencies
- ✅ Added `.env.example` template
- ✅ Installed all Python dependencies

### 2. Frontend Simplification
- ✅ **Removed Vercel AI SDK** (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`, etc.)
- ✅ Created custom `useSimpleChat` hook (`lib/hooks/use-simple-chat.ts`)
- ✅ Simplified `Chat` component
- ✅ Simplified `MultimodalInput` component (text-only, no attachments)
- ✅ Simplified `Messages` and `Message` components
- ✅ Removed complex features: tools, artifacts, data streams, reasoning

### 3. API Layer
- ✅ Updated Next.js `/api/chat` route to proxy requests to Flask
- ✅ Maintains SSE streaming format
- ✅ Handles errors gracefully

### 4. Development Workflow
- ✅ Added `concurrently` package
- ✅ Updated `package.json` scripts:
  - `pnpm run dev` - Starts both Next.js and Flask
  - `pnpm run dev:next` - Start only Next.js
  - `pnpm run dev:flask` - Start only Flask

### 5. Cleanup
- ✅ Deleted `lib/ai/` directory
- ✅ Removed AI SDK schema files
- ✅ Installed updated dependencies

## Architecture

```
User Input (Browser)
    ↓
Next.js Frontend (React)
    ↓
useSimpleChat Hook (Custom streaming)
    ↓
POST /api/chat (Next.js API Route - Proxy)
    ↓
POST http://localhost:5001/chat (Flask Server)
    ↓
OpenAI API (with streaming)
    ↓
SSE Stream back to client
    ↓
Real-time UI updates
```

## Message Format

**Simple structure:**
```typescript
{
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

## To Start Using

### 1. Configure OpenAI API Key

Edit `flask_server/.env`:
```bash
OPENAI_API_KEY=your_actual_openai_key_here
OPENAI_MODEL=gpt-4o-mini
PORT=5001  # Using 5001 because 5000 is often taken by macOS AirPlay
```

### 2. Start Development Servers

```bash
# Start both servers at once
pnpm run dev
```

Or separately:
```bash
# Terminal 1: Flask
pnpm run dev:flask

# Terminal 2: Next.js
pnpm run dev:next
```

### 3. Test the Application

1. Open http://localhost:3000
2. Type a message
3. Watch it stream in real-time from Flask → OpenAI → UI

## Key Files Changed

### Created:
- `flask_server/app.py` - Flask server with SSE streaming
- `flask_server/requirements.txt` - Python dependencies
- `flask_server/.env` - Configuration
- `lib/hooks/use-simple-chat.ts` - Custom chat hook

### Modified:
- `package.json` - Removed AI SDK, added concurrently, updated scripts
- `components/chat.tsx` - Uses new hook
- `components/multimodal-input.tsx` - Simplified
- `components/messages.tsx` - Simplified
- `components/message.tsx` - Simplified
- `app/(chat)/api/chat/route.ts` - Proxy to Flask

### Deleted:
- `lib/ai/` - AI SDK providers and models
- `app/(chat)/api/chat/schema.ts` - Complex schema

## Features Removed

For simplicity, the following were removed:
- ❌ File attachments / multimodal input
- ❌ Tool calling (weather, documents, etc.)
- ❌ Artifacts / code execution
- ❌ Reasoning display
- ❌ Data streams
- ❌ Vote system
- ❌ Complex authentication
- ❌ Database persistence

## What Still Works

- ✅ Real-time streaming responses
- ✅ OpenAI GPT-4o-mini integration
- ✅ Clean, modern UI
- ✅ Message history in session
- ✅ Stop generation
- ✅ Regenerate responses
- ✅ Markdown rendering
- ✅ Dark/light theme
- ✅ Responsive design

## Technical Details

### Flask SSE Format
```python
# Events sent from Flask:
event: start
data: {"type": "start", "timestamp": 1234567890}

event: message
data: {"type": "content", "content": "Hello", "timestamp": 1234567890}

event: done
data: {"type": "done", "fullContent": "Hello world", "timestamp": 1234567890}
```

### Frontend SSE Handling
- Uses `fetch()` with `ReadableStream`
- Manually parses SSE format
- Updates React state in real-time
- Handles connection cleanup

## Performance

- **Removed ~3MB** of AI SDK dependencies
- **Faster builds** - Fewer dependencies to bundle
- **More control** - Direct streaming implementation
- **Easier debugging** - Simple request/response flow

## Next Steps (Optional)

If you want to extend this:

1. **Add conversation history persistence** - Save to database
2. **Add file uploads** - Extend Flask to handle multipart/form-data
3. **Add more models** - Support multiple AI providers
4. **Add rate limiting** - Protect Flask endpoint
5. **Add authentication** - Secure the API
6. **Deploy** - Use Gunicorn for Flask, Vercel for Next.js

## Troubleshooting

### Flask not starting?
```bash
cd flask_server
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Next.js errors?
```bash
pnpm install
pnpm run dev:next
```

### No API key?
Edit `flask_server/.env` and add your OpenAI key.

### CORS errors?
Make sure Flask is running on port 5001 and CORS is enabled in `app.py`.

### Port 5000 already in use?
macOS AirPlay Receiver uses port 5000. We've changed Flask to use port 5001 instead.

## Success! 🎉

You now have a clean, simple, Flask-powered chatbot with real-time streaming!
