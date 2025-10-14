import { createOpenAI } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type CoreMessage } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages }: { messages: CoreMessage[] } = await req.json();

  // Configure OpenRouter
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    headers: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://your-app.vercel.app',
      'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'My Chat App',
    },
  });

  // Stream response from OpenRouter
  const result = await streamText({
    model: openrouter('mistralai/mistral-7b-instruct'), // ← You can change this model later!
    messages,
  });

  return result.toDataStreamResponse();
}
