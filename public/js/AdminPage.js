fetchStudents()

function checkLen(){
    let ul = document.getElementById('pending-student-list')
    if(ul.length == 0){
        let emptyList = document.createElement('p')
        emptyList.innerText = "No students Pending!"
        ul.appendChild(emptyList)
        return
    }
}

function fetchStudents() {

    fetch('/getPendingStudents', {
        method: 'GET'
    }).then((res) => {
        return res.json()
    }).then((data) => {
        updateList(data)
    }).catch((err) => {
        console.log(err)
    })

}

function updateList(data) {

    let ul = document.getElementById("pending-student-list")
    let n = data.length

    if (n == 0) {
        let emptyList = document.createElement('p')
        emptyList.innerText = "No students Pending!"
        ul.appendChild(emptyList)
        return
    }

    let details = Object.keys(data[0])
    let dn = details.length

    for (let i = 0; i < n; i++) {

        let student = document.createElement('div');
        student.setAttribute('id', data[i]['email'])
        student.classList.add('student')

        for (let j = 0; j < dn; j++) {

            let detail = document.createElement('div')
            detail.classList.add('detail')
            
            if (j == 0 || j == dn - 1) continue;
            detail.innerText = details[j] + " : " + data[i][details[j]]
            student.appendChild(detail)
        }

        let rejectBtn = document.createElement('button')
        let acceptBtn = document.createElement('button')
        rejectBtn.innerText = 'Reject'
        acceptBtn.innerText = 'Accept'

        rejectBtn.setAttribute('onclick', 'rejectStudent(event)')
        rejectBtn.setAttribute('email', data[i]['email'])
        acceptBtn.setAttribute('onclick', 'acceptStudent(event)')
        acceptBtn.setAttribute('email', data[i]['email'])

        student.appendChild(acceptBtn)
        student.appendChild(rejectBtn)

        ul.appendChild(student);
    }

}

function acceptStudent(event) {
    let email = event.target.attributes.email.value
    fetch('/accept/' + email, {
        method: 'GET'
    }).then((res) => {
        return res.json()
    }).then((data) => {
        if (!data) return
        document.getElementById(data.email).remove()
        checkLen()
    }).catch((err) => {
        console.log(err)
    })
}

function rejectStudent(event) {
    let email = event.target.attributes.email.value
    fetch('/reject/' + email, {
        method: 'GET'
    }).then((res) => {
        return res.json()
    }).then((data) => {
        if (!data) return
        document.getElementById(data.email).remove()
        checkLen()
    }).catch((err) => {
        console.log(err)
    })
}