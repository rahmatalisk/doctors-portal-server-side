const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

//Middle ware
app.use(cors())
app.use(express.json())



//MongoDb
const uri = `mongodb+srv://doctors-port:${process.env.DB_PASS}@cluster0.uhgiv4f.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect()
        console.log('db Connected')
        const serviceCollection = client.db('doctors-portal').collection('service')
        const bookingCollection = client.db('doctors-portal').collection('booking')

        //get service api
        app.get('/service',async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query)
            const service = await cursor.toArray()
            res.send(service)

        })
        //post booking api
        app.post('/booking',async(req,res)=>{
            const book = req.body;
            const cursor = await bookingCollection.insertOne(book)
            res.send(cursor)

        })

        // Warning: This is not the proper way to query multiple collection. 
    // After learning more about mongodb. use aggregate, lookup, pipeline, match, group
    app.get('/available', async (req, res) => {
        const date = req.query.date;
  
        // step 1:  get all services
        const services = await serviceCollection.find().toArray();
  
        // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
        const query = { date: date };
        const bookings = await bookingCollection.find(query).toArray();
  
        // step 3: for each service
        services.forEach(service => {
          // step 4: find bookings for that service. output: [{}, {}, {}, {}]
          const serviceBookings = bookings.filter(book => book.treatment === service.name);
          // step 5: select slots for the service Bookings: ['', '', '', '']
          const bookedSlots = serviceBookings.map(book => book.slot);
          // step 6: select those slots that are not in bookedSlots
          const available = service.slots.filter(slot => !bookedSlots.includes(slot));
          //step 7: set available to slots to make it easier 
          service.slots = available;
        });
  
  
        res.send(services);
      })
    }
    finally{

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Doctors Portal Server in running')
})

app.listen(port, () => {
    console.log('server is run', port)
})