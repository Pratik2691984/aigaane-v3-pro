module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'Aigaane V3 API is working!',
    time: new Date().toISOString(),
    path: req.url
  });
};
