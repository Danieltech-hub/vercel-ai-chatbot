import { OpenAIStream, StreamingTextResponse } from 'ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Configuration, OpenAIApi } from 'openai-edge';

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
     { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await req.json();

  // Configure OpenRouter using openai-edge
  const config = new Configuration({
    apiKey: process.env.OPENROUTER_API_KEY,
    basePath: 'https://openrouter.ai/api/v1',
  });

  const openai = new OpenAIApi(config);

  // Use any OpenRouter model
  const response = await openai.createChatCompletion({
    model: 'mistralai/mistral-7b-instruct', // ✅ OpenRouter model ID
    messages,
    stream: true,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || '',
      'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || '',
    },
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
