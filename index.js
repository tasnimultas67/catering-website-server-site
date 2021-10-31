const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.plp9f.mongodb.net:27017,cluster0-shard-00-01.plp9f.mongodb.net:27017,cluster0-shard-00-02.plp9f.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-7kj100-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    async function run(){
        try{
            await client.connect();
            // console.log('connected to database')
            const database = client.db('westernCatering');
            const servicesCollection = database.collection('services');
            const orderCollection =database.collection('orders')

            // GET API 
            app.get('/services', async(req, res)=>{
                const cursor = servicesCollection.find({});
                const services= await cursor.toArray();
                res.send({
                    services
                });
            })
            
            // GET API from manage Orders
            app.get('/manageorders', async(req, res)=>{
                const cursor = orderCollection.find({});
                const services= await cursor.toArray();
                res.send(services);
            })
            //GET API From single id
            app.get('/manageorders/:id', async(req, res)=>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const user = await orderCollection.findOne(query);
                // console.log('load user id', id);
                res.send(user);
            })
            

            // Add Order API
            app.post('/orders', async(req, res)=>{
                const order = req.body;
                // console.log('order', order);
                const result = await orderCollection.insertOne(order);
                res.json(result);
            })

            //GET Single Service 
            app.get('/services/:id', async(req, res) => {
                const id = req.params.id;
                // console.log('getting searching id', id)
                const query ={_id: ObjectId(id)};
                const service = await servicesCollection.findOne(query);
                res.json(service)

            })

            // POST API
            app.post('/services', async(req, res)=>{
                const service = req.body;
                // console.log('hit the api', service);
                const result = await servicesCollection.insertOne(service);
                // console.log(result);
                res.json(result);
            });

            //PUT API
            app.put('/manageorders/:id', async(req, res)=>{
                const id = req.params.id;
                const updatedUserOrder = req.body;
                const filter = {_id:ObjectId(id)};
                const options = {upsert: true};
                const updateDoc = {
                    $set: {
                        status: updatedUserOrder.status
                    },
                };
                const result = await orderCollection.updateOne(filter,updateDoc, options)
                // console.log("Updating user id",id);
                res.json(result);
            })

            //DELETE API
            app.delete('/services/:id', async(req, res)=>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const result = await servicesCollection.deleteOne(query);
                res.json(result);
            })
            // DELETE API 2
            app.delete('/ordered/:id', async(req, res)=>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const result = await orderCollection.deleteOne(query);
                res.json(result);
            })
        }
        finally{
            // await client.close()
        }
    }
    run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Running Western Catering Server in Browser')
})
// console.log(uri)
app.listen(port, ()=>{
    console.log('Running Server on port', port)
})