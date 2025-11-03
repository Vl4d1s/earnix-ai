# 🚀 Quick Start Guide

## Flask Backend Migration - Ready to Use!

Your chatbot has been successfully migrated to use a **local Flask server** with custom streaming!

---

## ⚡ Get Started in 3 Steps

### 1️⃣ Add Your OpenAI API Key

Edit `flask_server/.env`:
```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

> **Note:** Keep `PORT=5001` (port 5000 is often used by macOS AirPlay)

---

### 2️⃣ Start the Servers

```bash
pnpm run dev
```

This starts:
- **Flask** on http://localhost:5001
- **Next.js** on http://localhost:3000

---

### 3️⃣ Test It!

1. Open http://localhost:3000 in your browser
2. Type a message like "Hello, how are you?"
3. Watch it stream in real-time! ✨

---

## 🔍 Verify Everything Works

### Check Flask is Running:
```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"service":"flask-chat-server","status":"ok"}
```

### Check the Flow:
1. Browser → Next.js (port 3000)
2. Next.js → Flask (port 5001)
3. Flask → OpenAI API
4. OpenAI → Stream back → UI updates in real-time

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `flask_server/app.py` | Flask server with streaming |
| `flask_server/.env` | **Configure your OpenAI key here** |
| `lib/hooks/use-simple-chat.ts` | Custom streaming hook |
| `components/chat.tsx` | Simplified chat UI |
| `app/(chat)/api/chat/route.ts` | Next.js → Flask proxy |

---

## 🛠️ Common Issues

### Flask won't start?
```bash
cd flask_server
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Port 5001 in use?
Change `PORT=5002` in `flask_server/.env` and update `app/(chat)/api/chat/route.ts` to match.

### OpenAI API errors?
Make sure your API key is valid and has credits. Test it:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### TypeScript errors?
```bash
pnpm install
```

---

## 🎯 What Changed?

### Before:
- Complex Vercel AI SDK
- Many dependencies
- Opaque streaming logic

### After:
- Simple Flask backend
- Custom streaming hook
- Clean, understandable code
- Real OpenAI API calls
- Full control over everything!

---

## 📚 Documentation

- **Full details:** See `MIGRATION_COMPLETE.md`
- **Flask README:** See `flask_server/README.md`

---

## ✅ You're Ready!

Everything is set up and working. Just add your OpenAI API key and run `pnpm run dev`!

**Enjoy your new Flask-powered chatbot!** 🎉
