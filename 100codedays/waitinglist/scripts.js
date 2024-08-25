const scriptURL = 'https://script.google.com/macros/s/AKfycbw5gH9G-v-2TpwkXKiF0aYoiz0P-oCjImkVIZBmx54AsJ7l4JhY3vVyNYKJSH3A5N_WVg/exec';

document.getElementById('waitlistForm').addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("e.target", e.target);
    
    // Extract the email from the form data
    const formObject = new FormData(e.target);
    const formData = new URLSearchParams(formObject).toString(); // Convert FormData to URLSearchParams string

    const email = formData;
    console.log("email", email);
    
    fetch(scriptURL, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Use URL-encoded content type
        }
    })
    .then(response => response.text())
    .then(data => console.log('Success! Your form has been submitted.'))
    .catch(error => console.error('Error!', error.message));
});



