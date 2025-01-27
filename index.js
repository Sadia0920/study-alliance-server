require('dotenv').config()
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
// var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
// const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const usersCollection = database.collection("users");

    // JWT
    app.post('/jwt',async(req, res)=>{
      const user = req.body
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '6h'})
      res.send({token});
    })

    //Middlewares
    const verifyToken = (req,res,next)=>{
      // console.log('inside verify token', req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized access'});
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=> {
      if(err){
        return res.status(401).send({message: 'unauthorized access'});
      }
      req.decoded = decoded;
      next();
      });
    }

    const verifyAdmin = async(req,res,next)=>{
      const email = req.decoded.email;
      const  query = {email: email};
      const user = await usersCollection.findOne(query)
      const isAdmin = user?.role === 'admin';
      if(!isAdmin){
        return res.status(403).send({message: "forbidden access"})
      }
      next();
    }


    // users
    app.get('/users', verifyToken,verifyAdmin ,async(req,res)=>{
      const result = await usersCollection.find().toArray()
      res.send(result);
    })

    app.get('/users/admin/:email', verifyToken, async(req,res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message: "forbidden access"})
      }
      const  query = {email: email};
      const user = await usersCollection.findOne(query)
      let admin = false
      if(user){
        admin = user?.role === 'admin';
      }
      res.send({admin});
    })

    app.get('/users/tutor/:email', verifyToken,async(req,res)=>{
      const email = req.params.email;
      if(email !== req.decoded.email){
        return res.status(403).send({message: "forbidden access"})
      }
      const  query = {email: email};
      const user = await usersCollection.findOne(query)
      let tutor = false
      if(user){
        tutor = user?.role === 'tutor';
      }
      res.send({tutor});
    })

    app.patch('/users/tutor/:id',verifyToken,verifyAdmin,async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role:'tutor'
        }
      }
      const result = await usersCollection.updateOne(filter,updatedDoc)
      res.send(result);
    })

    app.patch('/users/student/:id',verifyToken,verifyAdmin,async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          role:'student'
        }
      }
      const result = await usersCollection.updateOne(filter,updatedDoc)
      res.send(result);
    })

    // app.get('/users', async(req,res)=>{
    //   const {searchParams} = req.query;
    //   let option = {};
    //   if(searchParams){
    //   option = {email: {$regex: searchParams, $options:"i"}}
    //   }
    //   const cursor = usersCollection.find(option);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })

    app.post('/users',async(req,res)=>{
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists',insertedId: null})
      }
      const result = await usersCollection.insertOne(user);
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

    app.post('/session',verifyToken,async(req,res)=>{
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
      const query = {studentEmail: email};
      const result = await bookedSessionCollection.find(query).toArray()
      res.send(result);
    })

    app.get('/bookedSession/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookedSessionCollection.findOne(query);
      res.send(result);
    })

    app.post('/bookedSession',verifyToken,async(req,res)=>{
      const booked = req.body;
      const result = await bookedSessionCollection.insertOne(booked)
      res.send(result)
    })

    // reviews
     app.get('/reviews',async(req,res)=>{
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })

    app.post('/reviews',async(req,res)=>{
      const review = req.body;
      const result = await reviewsCollection.insertOne(review)
      res.send(result)
    })

    // notes

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

    app.post('/notes',verifyToken,async(req,res)=>{
      const note = req.body;
      const result = await notesCollection.insertOne(note)
      res.send(result)
    })

    app.put('/notes/:id',verifyToken,async(req,res)=>{
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

    app.delete('/notes/:id',verifyToken,async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await notesCollection.deleteOne(query);
      res.send(result);
    })

    //materials

    app.get('/material',async(req,res)=>{
      const result = await materialsCollection.find().toArray()
      res.send(result);
    })

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

    app.put('/materials/:id',verifyToken,async(req,res)=>{
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

    app.delete('/materials/:id',verifyToken,async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await materialsCollection.deleteOne(query);
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