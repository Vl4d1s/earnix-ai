#!/usr/bin/env python3
"""
Simple Flask server for AI chatbot with SSE streaming.
Handles chat requests and streams responses from OpenAI API.
"""

import os
import json
import time
from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for local development

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Configuration
MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
PORT = int(os.getenv('PORT', 5000))


def format_sse(data: dict, event: str = 'message') -> str:
    """Format data as Server-Sent Event."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return {'status': 'ok', 'service': 'flask-chat-server'}, 200


@app.route('/chat', methods=['POST'])
def chat():
    """
    Main chat endpoint with SSE streaming.

    Expected request format:
    {
        "message": "User's message text",
        "conversationHistory": [
            {"role": "user", "content": "previous message"},
            {"role": "assistant", "content": "previous response"}
        ]
    }

    Streams response as Server-Sent Events.
    """

    def generate():
        """Generator function for streaming response."""
        try:
            # Parse request
            data = request.get_json()
            user_message = data.get('message', '')
            conversation_history = data.get('conversationHistory', [])

            if not user_message:
                yield format_sse({
                    'error': 'No message provided',
                    'type': 'error'
                }, 'error')
                return

            # Build messages array for OpenAI
            messages = conversation_history.copy()
            messages.append({
                'role': 'user',
                'content': user_message
            })

            # Send start event
            yield format_sse({
                'type': 'start',
                'timestamp': time.time()
            }, 'start')

            # Create streaming completion
            stream = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                stream=True,
                temperature=0.7,
                max_tokens=2000
            )

            # Stream the response
            full_response = ""
            for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    full_response += content

                    # Send content chunk
                    yield format_sse({
                        'type': 'content',
                        'content': content,
                        'timestamp': time.time()
                    }, 'message')

            # Send completion event
            yield format_sse({
                'type': 'done',
                'fullContent': full_response,
                'timestamp': time.time()
            }, 'done')

        except Exception as e:
            app.logger.error(f"Error in chat endpoint: {str(e)}")
            yield format_sse({
                'type': 'error',
                'error': str(e),
                'timestamp': time.time()
            }, 'error')

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive'
        }
    )


@app.route('/')
def index():
    """Root endpoint."""
    return {
        'service': 'Flask Chat Server',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/chat': 'POST - Chat with AI (SSE streaming)'
        }
    }


if __name__ == '__main__':
    print(f"Starting Flask server on http://localhost:{PORT}")
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=True,
        threaded=True
    )
