export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '你是一個即時字幕翻譯助手，請將輸入的外語逐句即時翻譯成繁體中文。' },
          { role: 'user', content: text }
        ]
      })
    });
    const data = await openaiRes.json();
    const translation = data.choices?.[0]?.message?.content?.trim() || '';
    res.status(200).json({ translation });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'OpenAI API call failed' });
  }
}
