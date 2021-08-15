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
        location.href = '/generateCertificate/' + data.email;
    })
}
