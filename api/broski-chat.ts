// 🤖 BROski AI Gateway — Vercel Serverless Function
// Powered by Vercel AI Gateway → Claude claude-opus-4-5
// Zero extra keys needed beyond AI_GATEWAY_API_KEY

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI_GATEWAY_API_KEY not configured' });
  }

  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4-5',
        input: [
          {
            type: 'message',
            role: 'system',
            content:
              'You are BROski — the hyper-intelligent AI mentor for the Hyper Vibe Coding Course. ' +
              'You help neurodivergent learners (ADHD/Dyslexia) with coding in a friendly, encouraging way. ' +
              'Short sentences. Bullet points. Celebrate wins. Say "Nice one BROski♾️" when they do well. ' +
              'Never write walls of text. Always give a ready-to-use example.',
          },
          ...(context ? [{ type: 'message', role: 'assistant', content: context }] : []),
          {
            type: 'message',
            role: 'user',
            content: prompt,
          },
        ],
        max_output_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI Gateway error:', errText);
      return res.status(502).json({ error: 'AI Gateway upstream error', detail: errText });
    }

    const data = await response.json();

    // Extract text from response
    const text =
      data?.output?.[0]?.content?.[0]?.text ??
      data?.output?.[0]?.content ??
      'BROski had a brain moment 🧠 — try again!';

    return res.status(200).json({
      reply: text,
      model: 'anthropic/claude-opus-4-5',
      gateway: 'vercel-ai-gateway',
    });
  } catch (err) {
    console.error('BROski chat error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
