const express = require('express')

const app = express()


let portName = 3000;
app.listen(portName , ()=>{
    console.log("Server running at port : " + portName);
})