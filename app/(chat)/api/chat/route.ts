export const maxDuration = 60;

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

export async function POST(request: Request) {
  try {
    // Clone the request to read the body
    const clonedRequest = request.clone();
    let body;

    try {
      const text = await request.text();
      if (!text) {
        throw new Error('Empty request body');
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Proxying to Flask:', body);

    // Forward request to Flask server
    const flaskResponse = await fetch(`${FLASK_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!flaskResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Flask server error' }),
        {
          status: flaskResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Stream the response back to the client
    return new Response(flaskResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error proxying to Flask:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to connect to Flask server' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
