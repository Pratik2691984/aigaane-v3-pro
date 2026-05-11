const fs = require('fs');
const path = require('path');

// Read the ragas data file directly
const ragasPath = path.join(__dirname, '../data/ragas.json');
const ragaData = JSON.parse(fs.readFileSync(ragasPath, 'utf8'));

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const url = req.url;
  
  // GET /api/health
  if (url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      version: '3.0.0',
      ragas: Object.keys(ragaData.hindustani).length,
      timestamp: new Date().toISOString()
    });
  }
  
  // GET /api/ragas
  if (url === '/api/ragas') {
    const list = Object.entries(ragaData.hindustani).map(([name, data]) => ({
      name: name,
      rasa: data.rasa,
      samay: data.samay,
      therapeutic: data.therapeutic,
      valence: data.valence,
      arousal: data.arousal
    }));
    return res.status(200).json(list);
  }
  
  // GET /api/raga/:name
  if (url.startsWith('/api/raga/')) {
    const name = url.split('/api/raga/')[1];
    const raga = ragaData.hindustani[name];
    if (raga) {
      return res.status(200).json({
        name: name,
        ...raga
      });
    }
    return res.status(404).json({ error: 'Raga not found' });
  }
  
  // GET /api/rasa/:name
  if (url.startsWith('/api/rasa/')) {
    const rasaName = url.split('/api/rasa/')[1];
    const ragas = Object.entries(ragaData.hindustani)
      .filter(([_, data]) => data.rasa === rasaName)
      .map(([name, data]) => ({ name, ...data }));
    
    if (ragas.length > 0) {
      return res.status(200).json({
        rasa: rasaName,
        ragas: ragas,
        count: ragas.length
      });
    }
    return res.status(404).json({ error: 'Rasa not found' });
  }
  
  // POST /api/recommend
  if (url === '/api/recommend' && req.method === 'POST') {
    let body = '';
    await new Promise((resolve) => {
      req.on('data', chunk => { body += chunk; });
      req.on('end', resolve);
    });
    
    let intent_rasa = null;
    let samay = null;
    try {
      const parsed = JSON.parse(body);
      intent_rasa = parsed.intent_rasa;
      samay = parsed.samay;
    } catch(e) {}
    
    let recommendations = Object.entries(ragaData.hindustani)
      .filter(([_, data]) => {
        if (intent_rasa && data.rasa !== intent_rasa) return false;
        if (samay && samay !== 'Any' && data.samay !== samay) return false;
        return true;
      })
      .map(([name, data]) => ({
        raga: name,
        rasa: data.rasa,
        samay: data.samay,
        therapeutic: data.therapeutic
      }))
      .slice(0, 5);
    
    return res.status(200).json({
      intent: { rasa: intent_rasa || 'Any', samay: samay || 'Any' },
      recommendations: recommendations,
      timestamp: new Date().toISOString()
    });
  }
  
  // 404 for unknown endpoints
  return res.status(404).json({
    error: 'Endpoint not found',
    available: ['/api/health', '/api/ragas', '/api/raga/{name}', '/api/rasa/{name}', '/api/recommend']
  });
};
