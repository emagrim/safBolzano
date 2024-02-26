let screenSize;

async function animateBars() {
    let bars = document.querySelector('.bars-icon');
    bars.classList.toggle('active');
}
async function toggleNav(screenSize) {
    let navItems = document.querySelectorAll('.gridInnerCenter a.navItem');

    for (let i = 0; i < navItems.length; i++) {
        if (!screenSize) {
            navItems[i].style.display = 'none';
        } else {
            navItems[i].style.display = 'flex';
            let bars = document.querySelector('.bars-icon');
            bars.classList.toggle('active');
        }
    }
}

function onClickToggleNav() {
    let navItems = document.querySelectorAll('.gridInnerCenter a.navItem');

    for (let i = 0; i < navItems.length; i++) {
        if (navItems[i].style.display === 'none') {
            navItems[i].style.display = 'flex';
            console.log("set to flex");
        } else if (navItems[i].style.display === 'flex') {
            navItems[i].style.display = 'none';
            console.log("set to none");
        } else {
            navItems[i].style.display = 'flex';
        }
    }

    animateBars();
}

function handleScreenSizeChange() {
    screenSize = window.innerWidth >= 1045;

    if (screenSize) {
        console.log('Desktop view');
        toggleNav(true);
    } else {
        console.log('Mobile view');
        toggleNav(false);
    }

    return screenSize;
}

window.addEventListener('resize', handleScreenSizeChange);

document.addEventListener('DOMContentLoaded', function () {

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

    setTimeout(handleScreenSizeChange(), 10000);
    setTimeout(animateBars(), 10000);

});