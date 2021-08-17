const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const mongoose = require('mongoose')
const cors = require('cors')
const randomize = require('randomatic')

const app = express()

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))
app.use(cors())

const dburl = "Apna daal le bhai"
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

const certificateCodeSchema = new mongoose.Schema({
    email: String,
    certificateCode: String
})

const student = mongoose.model('student', studentSchema)
const status = mongoose.model('status', statusSchema)
const certificateCode = mongoose.model('certificateCode', certificateCodeSchema)

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/html/HomePage.html')
})

app.post('/saveStudentDetails', async (req, res) => {
    let data = req.body

    if (data.email == "" || data.email == null) {
        res.send("Please Enter a valid Email")
        return
    }

    let studentExists = await student.findOne({ email: data.email })
    if (studentExists) {
        res.send("Certificate has already been requested")
        return
    }

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

    status.findOne({ email: email }, async (err, obj) => {
        if (err) {
            console.log(err)
            return
        } else {

            if (!obj) {
                res.send({ status: "No Record Found" })
            } else {
                if (obj.status == "Pending") {
                    res.send({ status: "Application Pending" })
                } else {

                    let certificateExists = await certificateCode.findOne({ email: email });
                    if (certificateExists != null) {
                        res.send({ status: "Accepted", certificateCode: certificateExists.certificateCode })
                        return
                    }

                    do {
                        var newCertificateCode = randomize('Aa0!', 20);
                        var codeExists = await certificateCode.findOne({ certificateCode: newCertificateCode })
                    } while (codeExists != null);

                    let newCertificate = new certificateCode({
                        email: email,
                        certificateCode: newCertificateCode
                    })
                    newCertificate.save()

                    res.send({ status: "Accepted", certificateCode: newCertificateCode })
                }
            }
        }
    })
})

app.get('/generateCertificate/:certificateCode', async (req, res) => {

    let code = await certificateCode.findOne({ certificateCode: req.params.certificateCode })
    if (code == null) {
        res.send("Invalid Certificate Code")
        return
    }
    let email = code.email
    student.findOne({ email: email }, (err, obj) => {
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
            res.send({ email: email })
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
            res.send({ email: email })
        }
    })
})

let portName = process.env.PORT || 3000;
app.listen(portName, () => {
    console.log("nice");
})