require('dotenv').config()
const { json } = require('express')
const express = require('express')
const mongoose = require('mongoose')
const Product = require('./models/productModel')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
let users = []

app.use(express.json())


app.post('/login', (req, res) => {
    const username = req.body.username
    const user = { name: username}

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken})
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.post('/users', async(req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { name: req.body.name, password:hashedPassword}
        users.push(user)
        res.status(201).send()

    } catch {
        res.status(500).send()
    }
    
})

app.post('/users/login', async(req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if(user == null) {
        return res.status(400).send('Cannot find user')
    }
    try{
        if(await bcrypt.compare(req.body.password, user.password)) {
            res.send('Success')
        }else {
            res.send('Not allowed')
        }
    }catch{
        res.status(500).send()
    }
})





mongoose.set("strictQuery", false)
mongoose.connect(
    "mongodb://127.0.0.1:27017/costomer-ticket-system",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoCreate: true,
    },
    app.listen(4000, ()=> {
        console.log(`Node api app is running on port 4000`)
    }),
    function () {
      console.log("Mongoose Is Connected");
    }
  );