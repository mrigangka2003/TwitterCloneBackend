const mongoose = require('mongoose') ;
const dotenv = require('dotenv') ;
const {app} = require('./app.js')
// const connectDB = require('./config/db.js')

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 5000


app.get('/',(req,res)=>{
    res.send('WE are working')    
})

app.listen(PORT,()=>{
    console.log(`Its working on ${PORT}`)
})

