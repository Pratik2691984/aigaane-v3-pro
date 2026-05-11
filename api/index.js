// Aigaane V3 PRO API - Serverless Function
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Raga data
  const ragaData = {
    Yaman: { rasa: "Shringara", samay: "Night", therapeutic: "Romantic elevation" },
    Bhairav: { rasa: "Shanti", samay: "Dawn", therapeutic: "Anxiety relief" },
    Shivaranjani: { rasa: "Karuna", samay: "Night", therapeutic: "Grief release" },
    Malkauns: { rasa: "Shanti", samay: "Late Night", therapeutic: "Deep meditation" },
    Todi: { rasa: "Karuna", samay: "Morning", therapeutic: "Trauma processing" },
    Bhoopali: { rasa: "Bhakti", samay: "Evening", therapeutic: "Devotion" },
    Khamaj: { rasa: "Hasya", samay: "Evening", therapeutic: "Joy" },
    Darbari: { rasa: "Veera", samay: "Late Night", therapeutic: "Courage" }
  };
  
  const url = req.url;
  
  // Health check
  if (url === '/api/health' || url === '/health') {
    return res.status(200).json({
      status: 'healthy',
      version: '3.0.0',
      ragas: Object.keys(ragaData).length,
      timestamp: new Date().toISOString()
    });
  }
  
  // Get all ragas
  if (url === '/api/ragas' || url === '/ragas') {
    const list = Object.entries(ragaData).map(([name, data]) => ({
      name, rasa: data.rasa, samay: data.samay, therapeutic: data.therapeutic
    }));
    return res.status(200).json(list);
  }
  
  // Get single raga
  if (url.startsWith('/api/raga/') || url.startsWith('/raga/')) {
    const name = url.split('/').pop();
    const raga = ragaData[name];
    if (raga) {
      return res.status(200).json({ name, ...raga });
    }
    return res.status(404).json({ error: 'Raga not found' });
  }
  
  // Get recommendation
  if ((url === '/api/recommend' || url === '/recommend') && req.method === 'POST') {
    const { intent_rasa, samay } = req.body || {};
    const recommendations = Object.entries(ragaData)
      .filter(([_, data]) => {
        if (intent_rasa && data.rasa !== intent_rasa) return false;
        if (samay && samay !== 'Any' && data.samay !== samay) return false;
        return true;
      })
      .map(([name, data]) => ({ raga: name, rasa: data.rasa, samay: data.samay, therapeutic: data.therapeutic }))
      .slice(0, 5);
    
    return res.status(200).json({
      intent: { rasa: intent_rasa || 'Any', samay: samay || 'Any' },
      recommendations,
      timestamp: new Date().toISOString()
    });
  }
  
  // Default response for API root
  if (url === '/api' || url === '/') {
    return res.status(200).json({
      message: 'Aigaane V3 API',
      endpoints: ['/api/health', '/api/ragas', '/api/raga/{name}', '/api/recommend']
    });
  }
  
  return res.status(404).json({ error: 'Endpoint not found' });
}
