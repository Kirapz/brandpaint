const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors()); 
app.use(express.json()); 

const generateRoute = require('./routes/generate');

app.use('/api/generate', generateRoute);

app.listen(5000, () => {
  console.log(`Server is running on port 5000`);
});