export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.VIEWMAX_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Task ID required' });
  }

  try {
    const response = await fetch(`https://viewmax.studio/api/v1/tasks/${id}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Status check failed' });
    }

    // Build response for frontend
    const result = {
      status: data.status || 'unknown'
    };

    // Extract video URL when successful
    if (data.status === 'success') {
      if (data.video_urls && data.video_urls.length > 0) {
        result.video_url = data.video_urls[0];
      } else if (data.video_url) {
        result.video_url = data.video_url;
      }
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      result.error = data.error || data.message || 'Task failed';
    }

    res.status(200).json(result);

  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Network error checking status' });
  }
}
