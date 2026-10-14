require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`LMS API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`));
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
})();
