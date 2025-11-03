# Flask Chat Server

Simple Flask server for the AI chatbot with SSE (Server-Sent Events) streaming.

## Setup

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

4. Run the server:
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /chat
Streams AI responses using Server-Sent Events.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "conversationHistory": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ]
}
```

**Response:** SSE stream with events:
- `start`: Streaming started
- `message`: Content chunks
- `done`: Streaming completed
- `error`: Error occurred

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "flask-chat-server"
}
```

## Development

The server runs in debug mode by default for development. For production, use a proper WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
