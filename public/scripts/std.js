function loadHTML(url, containerId) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById(containerId).innerHTML = this.responseText;
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

loadHTML('/partials/navbar.html', 'nav');
loadHTML('/partials/footer.html', 'foot');