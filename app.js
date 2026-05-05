const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/energy', require('./routes/energy'));
app.use('/api/tips',   require('./routes/tips'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Energy Tracker API running on port ${PORT}`);
});
