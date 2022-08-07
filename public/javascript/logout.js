async function logout() {
    const response = await fetch('api/users/logout', {
        method: 'post',
        header: { 'Content-Type': 'application/json'}
    });

    if ( response.ok ) {
        document.location.replace('/')
    }
    else {
        alert(response.statusText);
    }
}

document.querySelector('#logout').addEventListener('click', logout);

/*
replace()
The replace() method replaces the current document with a new one.
replace() removes the current URL from the document history.
With replace() it is not possible to use "back" to navigate back to the original document.
*/