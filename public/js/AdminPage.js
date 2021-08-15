fetchStudents()

function fetchStudents(){
    
    fetch('/getPendingStudents' , {
        method : 'GET'
    }).then((res)=>{
        return res.json()
    }).then((data)=>{
        updateList(data)
    }).catch((err)=>{
        console.log(err)
    })

}

function updateList(data){

    console.log(data)

}