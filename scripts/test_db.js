const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const mongoUrl = process.env.MONGO_URL;
console.log('Connecting to:', mongoUrl);

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Successfully connected to the database');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  });
