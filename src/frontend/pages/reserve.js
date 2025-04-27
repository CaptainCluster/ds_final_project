const getEmailFromUrl = () => {
    let url = window.location.search.substring(1);
    const email = url.split("=")[1];
    return email;
}

const email = getEmailFromUrl();
console.log(email)