export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.VIEWMAX_API_KEY;
  if (!API_KEY) {
    // Return fallback models if no API key
    return res.status(200).json({ 
      models: [
        { id: 'sora-2', name: 'Sora-2' },
        { id: 'sora-pro', name: 'Sora Pro' }
      ] 
    });
  }

  try {
    const response = await fetch('https://viewmax.studio/api/v1/models', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!response.ok) {
      // Return fallback if models endpoint fails
      return res.status(200).json({ 
        models: [
          { id: 'sora-2', name: 'Sora-2' },
          { id: 'sora-pro', name: 'Sora Pro' }
        ] 
      });
    }

    const data = await response.json();
    
    // Handle different response formats
    let models = [];
    if (Array.isArray(data)) {
      models = data;
    } else if (data.models && Array.isArray(data.models)) {
      models = data.models;
    } else if (data.data && Array.isArray(data.data)) {
      models = data.data;
    } else {
      // Fallback
      models = [{ id: 'sora-2', name: 'Sora-2' }];
    }

    res.status(200).json({ models });

  } catch (err) {
    // Fallback on any error
    res.status(200).json({ 
      models: [
        { id: 'sora-2', name: 'Sora-2' },
        { id: 'sora-pro', name: 'Sora Pro' }
      ] 
    });
  }
}
