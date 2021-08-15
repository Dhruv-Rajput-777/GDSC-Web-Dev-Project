const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname ,'/public')))

const dburl = "mongodb+srv://admin:admin@cluster0.qapif.mongodb.net/gdscDB?retryWrites=true&w=majority"
mongoose.connect(dburl , { useNewUrlParser: true, useUnifiedTopology: true, })

const studentSchema = new mongoose.Schema({
    email : String,
    name : String,
    division : String,
    year : String,
    department : String
})

const statusSchema = new mongoose.Schema({
    email : String,
    status : String
})

const student = mongoose.model("student" , studentSchema)
const status = mongoose.model("status" , statusSchema)

app.get('/',(req, res)=>{
    res.sendFile(__dirname + '/public/html/HomePage.html')
})

app.get('/adminLogin',(req, res)=>{
    res.render('AdminLogin');
})

app.post('/adminLogin',(req, res)=>{
    let data = req.body;
    if(data.email == "admin@gmail.com" && data.password == "admin1234"){
        res.redirect('/admin')
    }
    else
    {
        res.redirect('/adminLogin')
    }
})

app.post('/getCertificate' , (req, res)=>{
    const email = req.body.email;
    status.findOne({email : email} , (err , obj)=>{
        if(err){
            console.log(err)
            return
        }else{
            if(!obj){
                res.send({status : "No Record Found"})
                return
            }else{
                res.send({status : obj.status})
            }
        }
    })
})

app.get('/admin',(req, res)=>{
    res.render('AdminPage')
})


let portName = 3000 || process.env.PORT;
app.listen(portName , ()=>{
    console.log("Server running at port : " + portName);
})