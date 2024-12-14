let screenSize;
let isOpen;

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
        isOpen = barsIcon && barsIcon.classList.contains('active');
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

setTimeout(function() {
    const cookieConsentTag = document.querySelector('.cc-window');

    if (cookieConsentTag) {
        const cc = new CookieConsent({
            content: {
                message: "Non utilizziamo i cookies, ci teniamo alla tua privacy.",
                dismiss: "Accetta",
                link: "Leggi di più",
            },
            theme: "classic",
            palette: {
                popup: { background: "#2B373B" },
                button: { background: "#f1d600" },
            },
            onAccept: function () {
                console.log("Cookies accettati!");
            },
        });
        cc.init();
    } else {
        console.error('Il tag del banner dei cookie non è stato caricato correttamente.');
    }
}, 10000);


function applyLazyLoading() {
    // Seleziona tutti i tipi di elementi multimediali che supportano 'loading'
    const lazyElements = document.querySelectorAll('img[src], iframe[src], video[src]');

    lazyElements.forEach(el => {
        if (!el.hasAttribute('loading')) {
            el.setAttribute('loading', 'lazy'); // Aggiungi l'attributo
            console.log(`Aggiunto "loading=lazy" a ${el.tagName} con src: ${el.src}`);
        }
    });
}

// Esegui al caricamento della pagina
document.addEventListener('DOMContentLoaded', applyLazyLoading);
