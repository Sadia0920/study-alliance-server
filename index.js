// require('dotenv').config()
const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Welcome to Study Alliance Server')
})

app.listen(port, () => {
  console.log(`Study Alliance Server Running on port ${port}`)
})