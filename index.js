require('dotenv').config()
const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g9mg4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("studyAllianceDB");
    const sessionCollection = database.collection("session");
    const bookedSessionCollection = database.collection("bookedSession");
    const notesCollection = database.collection("notes");
    const reviewsCollection = database.collection("reviews");
    const materialsCollection = database.collection("materials");


    //materials
    app.get('/materials',async(req,res)=>{
      const email = req.query.email;
      const query = {tutorEmail: email};
      const result = await materialsCollection.find(query).toArray()
      res.send(result);
    })

    app.get('/materials/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await materialsCollection.findOne(query);
      res.send(result);
    })

    app.post('/materials',async(req,res)=>{
      const data = req.body;
      const result = await materialsCollection.insertOne(data);
      res.send(result);
    })

    app.put('/materials/:id',async(req,res)=>{
      const id = req.params.id;
      const newMaterial = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true}
      const updateMaterial = {
        $set: {
          title: newMaterial.title,
          image: newMaterial.image,
          link: newMaterial.link
        }
      }
      const result = await materialsCollection.updateOne(filter,updateMaterial,options)
      res.send(result)
    })

    app.delete('/materials/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await materialsCollection.deleteOne(query);
      res.send(result);
    })

    
    // session
    app.get('/session',async(req,res)=>{
      const result = await sessionCollection.find().toArray()
      res.send(result);
    })

     app.get('/session/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await sessionCollection.findOne(query);
      res.send(result);
    })

    app.get('/sessions',async(req,res)=>{
      const email = req.query.email;
      const query = {tutorEmail: email};
      const result = await sessionCollection.find(query).toArray()
      res.send(result);
    })

    app.post('/session',async(req,res)=>{
      const data = req.body;
      const result = await sessionCollection.insertOne(data);
      res.send(result);
    })

    // bookedSession

    // app.get('/bookedSession',async(req,res)=>{
    //   const result = await bookedSessionCollection.find().toArray();
    //   res.send(result);
    // })

    app.get('/bookedSession',async(req,res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await bookedSessionCollection.find(query).toArray()
      res.send(result);
    })

    app.get('/bookedSession/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookedSessionCollection.findOne(query);
      res.send(result);
    })

    app.post('/bookedSession',async(req,res)=>{
      const booked = req.body;
      const result = await bookedSessionCollection.insertOne(booked)
      res.send(result)
    })

    // reviews
    app.post('/reviews',async(req,res)=>{
      const review = req.body;
      const result = await reviewsCollection.insertOne(review)
      res.send(result)
    })

    // notes
    app.post('/notes',async(req,res)=>{
      const note = req.body;
      const result = await notesCollection.insertOne(note)
      res.send(result)
    })

    app.get('/notes/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await notesCollection.findOne(query);
      res.send(result);
    })

    app.get('/notes',async(req,res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await notesCollection.find(query).toArray()
      res.send(result);
    })

    app.put('/notes/:id',async(req,res)=>{
      const id = req.params.id;
      const newNote = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true}
      const updateNote = {
        $set: {
          title: newNote.title,
          description: newNote.description,
        }
      }
      const result = await notesCollection.updateOne(filter,updateNote,options)
      res.send(result)
    })

    app.delete('/notes/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await notesCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Welcome to Study Alliance Server')
})

app.listen(port, () => {
  console.log(`Study Alliance Server Running on port ${port}`)
})