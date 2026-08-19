export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.VIEWMAX_API_KEY;
  if (!API_KEY) {
    return res.status(200).json({ balance: '?' });
  }

  try {
    const response = await fetch('https://viewmax.studio/api/v1/credits', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!response.ok) {
      return res.status(200).json({ balance: '?' });
    }

    const data = await response.json();
    
    // Handle different response formats
    let balance = '?';
    if (data.balance !== undefined) balance = data.balance;
    else if (data.credits !== undefined) balance = data.credits;
    else if (data.credit_balance !== undefined) balance = data.credit_balance;
    
    res.status(200).json({ balance });

  } catch (err) {
    // Don't fail the UI, show placeholder
    res.status(200).json({ balance: '?' });
  }
}
