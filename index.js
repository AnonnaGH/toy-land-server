const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.2fbz8ar.mongodb.net/?retryWrites=true&w=majority`;

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
        const toysCollection = client.db('toysDB').collection('toys');
        // await client.connect();
        // Send a ping to confirm a successful connection


        app.post('/toys', async (req, res) => {
            const toy = req.body;
            console.log('new toy', toy);
            const result = await toysCollection.insertOne(toy);
            res.send(result);
        })


        // search functionality
        app.get("/toySearchByName/:text", async (req, res) => {
            const searchText = req.params.text;
            const result = await toysCollection
                .find({
                    $or: [
                        { ToyName: { $regex: searchText, $options: "i" } }

                    ],
                })
                .toArray();
            res.send(result);
        });

        // delete functionality

        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            console.log('Please delete', id);
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })

        //Update functionality
        app.put('/toysUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(id, body);

            const filter = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    ToyName: body.ToyName,
                    SubCategory: body.SubCategory,
                    Price: body.Price,
                    AvailableQuantity: body.AvailableQuantity,
                    Pictureurl: body.Pictureurl,
                    Details: body.Details,
                },
            };
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result);


        })

        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find()
            const result = await cursor.limit(20).toArray();
            res.send(result);
        })


        // app.get('/toys', async (req, res) => {
        //     const limit = 20;
        //     const result = await toysCollection.find(query).limit(limit).toArray();
        //     res.send(result)
        // })

        app.get('/my-toys/:email', async (req, res) => {
            let email = { email: req.params.email };
            const result = await toysCollection.find(email).limit(20).toArray();
            res.send(result)
        })

        app.get('/toys/:text', async (req, res) => {
            console.log(req.params.text)
            if (req.params.text == "regular" || req.params.text == "sports" || req.params.text == "truck") {
                //  const cursor =toysCollection.find({SubCategory: req.params.text})
                const result = await toysCollection.find({ SubCategory: req.params.text }).toArray();
                return res.send(result);
            } else {
                // const cursor =toysCollection.find({})
                const result = await toysCollection.find({}).toArray();
                res.send(result);
            }

        })

        app.get('/toys/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('ToyLand server is running!')
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
