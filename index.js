const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cfnw7jn.mongodb.net/?retryWrites=true&w=majority`;

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

    const servicesCollections = client.db('cardoctor').collection('services');
    const bookingCollections = client.db('cardoctor').collection('bookings');



    app.get('/services', async(req,res)=>{
        const cursor = servicesCollections.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/services/:id', async (req,res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}


        const options = {
           
            // Include only the `title` and `imdb` fields in the returned document
            projection: { service_id:1, title: 1, price: 1, img: 1 },
          };

        

        const result = await servicesCollections.findOne(query,options);

        res.send(result);


    });


    app.get('/bookings', async (req,res) =>{
      console.log(req.query.email);
      let query = {};
      if(req.query?.email){
        query= {email: req.query.email}
      }
      const result = await bookingCollections.find(query).toArray();
      res.send(result);
    })

    
    app.post('/bookings', async (req,res) =>{
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollections.insertOne(booking);
      res.send(result);
    })

    app.delete('/bookings/:id', async (req,res) =>{
        
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await bookingCollections.deleteOne(query)
        res.send(result);
    })

    app.patch('/bookings/:id', async (req,res) =>{
      const id = req.params.id;
      const filter ={_id: new ObjectId(id)};
      const updateBooking = req.body;
      console.log(updateBooking);
      const updatedDoc = {
        $set: {
          status : updateBooking.status
        },
      };

      const result = await bookingCollections.updateOne(filter, updatedDoc);
      res.send(result)

    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  




  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })