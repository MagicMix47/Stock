require('dotenv').config();
const express = require('express');
const cors = require('cors');
const holdingsRouter = require('./routes/holdings');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/holdings', authMiddleware, holdingsRouter);

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
