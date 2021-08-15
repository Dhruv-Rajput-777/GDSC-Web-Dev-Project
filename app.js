const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))
app.use(cors())

const dburl = "mongodb+srv://admin:admin@cluster0.qapif.mongodb.net/gdscDB?retryWrites=true&w=majority"
mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true })

const studentSchema = new mongoose.Schema({
    email: String,
    name: String,
    division: String,
    year: String,
    department: String
})

const statusSchema = new mongoose.Schema({
    email: String,
    status: String
})

const student = mongoose.model("student", studentSchema)
const status = mongoose.model("status", statusSchema)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/HomePage.html')
})

app.post('/saveStudentDetails', (req, res) => {
    let data = req.body

    let newStudent = new student({
        email: data.email,
        name: data.name,
        department: data.department,
        division: data.division,
        year: data.year
    })
    newStudent.save().then(() => {

        let studentStatus = new status({
            email: data.email,
            status: "Pending"
        })

        studentStatus.save().then(() => {
            res.send("Details saved successfully")
        }).catch((err) => {
            console.log(err)
            res.send("There was a problem uploading your details! Please try again")
        })

    }).catch((err) => {
        console.log(err)
        res.send("There was a problem uploading your details! Please try again")
    })
})

app.get('/adminLogin', (req, res) => {
    res.sendFile(__dirname + '/public/html/AdminLogin.html');
})

app.post('/adminLogin', (req, res) => {
    let data = req.body;
    if (data.email == "admin@gmail.com" && data.password == "admin1234") {
        res.redirect('/admin')
    } else {
        res.redirect('/adminLogin')
    }
})

app.post('/getCertificate', (req, res) => {
    const email = req.body.email;
    status.findOne({ email: email }, (err, obj) => {
        if (err) {
            console.log(err)
            return
        } else {
            if (!obj) {
                res.send({ status: "No Record Found" })
                return
            } else {
                if (obj.status == "Pending") {
                    res.send({ status: "Application Pending" })
                } else {
                    res.send({email : email})
                }
            }
        }
    })
})

app.get('/generateCertificate/:email', (req, res) => {

    student.findOne({ email: req.params.email }, (err, obj) => {
        if (err) {
            console.log(err)
            return
        } else {
            if (!obj) return
            const name = obj.name
            const year = obj.year
            const department = obj.department
            const division = obj.division
            res.render('certificate', { name: name, year: year, department: department, division: division })
        }
    })
})

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/html/AdminPage.html')
})

app.get('/getPendingStudents', (req, res) => {
    status.find({ status: "Pending" }, async (err, obj) => {
        if (err) {
            console.log(err)
            return
        } else {
            let n = obj.length;
            let studentDetails = []

            for (let i = 0; i < n; i++) {
                let newStudent = await student.findOne({ email: obj[i].email })
                delete newStudent['_id']
                delete newStudent['__v']
                studentDetails.push(newStudent)
            }
            res.send(studentDetails)
        }
    })
})

app.get('/accept/:email', (req, res) => {
    const email = req.params.email

    status.findOne({ email: email }, (err, obj) => {
        if (err) {
            console.log(err)
            return
        } else {
            obj.status = "Accepted"
            obj.save()
        }
    })
})

app.get('/reject/:email', (req, res) => {
    const email = req.params.email
    status.findOne({ email: email }, (err, obj) => {
        if (err) {
            console.log(err)
            return
        } else {
            obj.status = "Rejected"
            obj.save()
        }
    })
})

let portName = process.env.PORT || 3000;
app.listen(portName, () => {
    console.log("nice");
})