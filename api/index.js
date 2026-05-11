const ragaData = require('../data/ragas.json');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const url = req.url;
  
  if (url === '/api/health') {
    return res.status(200).json({ status: 'healthy', version: '3.0.0', ragas: Object.keys(ragaData.hindustani).length });
  }
  
  if (url === '/api/ragas') {
    const list = Object.entries(ragaData.hindustani).map(([name, d]) => ({ name, rasa: d.rasa, samay: d.samay, therapeutic: d.therapeutic }));
    return res.status(200).json(list);
  }
  
  if (url.startsWith('/api/raga/')) {
    const name = url.split('/api/raga/')[1];
    const raga = ragaData.hindustani[name];
    if (raga) return res.status(200).json({ name, ...raga });
    return res.status(404).json({ error: 'Raga not found' });
  }
  
  if (url === '/api/recommend' && req.method === 'POST') {
    let body = '';
    await new Promise(resolve => { req.on('data', c => body += c); req.on('end', resolve); });
    const { intent_rasa, samay } = JSON.parse(body || '{}');
    const recommendations = Object.entries(ragaData.hindustani)
      .filter(([_, d]) => (!intent_rasa || d.rasa === intent_rasa) && (!samay || samay === 'Any' || d.samay === samay))
      .map(([name, d]) => ({ raga: name, rasa: d.rasa, samay: d.samay, therapeutic: d.therapeutic }));
    return res.status(200).json({ intent: { rasa: intent_rasa, samay }, recommendations: recommendations.slice(0, 5) });
  }
  
  return res.status(404).json({ error: 'Endpoint not found' });
};
