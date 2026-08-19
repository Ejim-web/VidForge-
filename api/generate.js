export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.VIEWMAX_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Add VIEWMAX_API_KEY in Vercel env variables.' });
  }

  const { prompt, model, duration, resolution, aspect_ratio } = req.body;
  
  if (!prompt || prompt.trim().length < 3) {
    return res.status(400).json({ error: 'Prompt must be at least 3 characters' });
  }

  try {
    const response = await fetch('https://viewmax.studio/api/v1/videos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'sora-2',
        mode: 'text-to-video',
        prompt: prompt.trim(),
        options: {
          duration: duration || '8s',
          resolution: resolution || '720p',
          aspect_ratio: aspect_ratio || '16:9'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Check for credit-related errors
      const errorMsg = data.error || data.message || 'ViewMax API error';
      if (errorMsg.toLowerCase().includes('credit') || errorMsg.toLowerCase().includes('balance')) {
        return res.status(402).json({ 
          error: 'Insufficient ViewMax credits. Please check your ViewMax account balance.' 
        });
      }
      return res.status(response.status).json({ error: errorMsg });
    }

    if (!data.task_id) {
      return res.status(500).json({ error: 'No task ID returned from ViewMax' });
    }

    res.status(200).json({ task_id: data.task_id });

  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Network error contacting ViewMax API' });
  }
}
