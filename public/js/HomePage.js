function getCertificate(event) {
    event.preventDefault()

    let email = document.getElementById('check-mail').value

    fetch('/getCertificate', {
        method: 'POST',
        body: JSON.stringify({ email: email }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then((res) => {
        return res.json()
    }).then((data) => {
        if (data.status != 'Accepted') {
            document.getElementById('status').innerText = data.status
        } else {
            location.href = '/generateCertificate/' + data.certificateCode;
        }
    })
}
