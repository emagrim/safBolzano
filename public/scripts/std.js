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

function enableLazyLoading() {
    // Seleziona tutte le immagini, video, iframe, e altri elementi supportati
    const elements = document.querySelectorAll('img, video, iframe, source, picture, object');

    elements.forEach(element => {
        // Aggiungi l'attributo loading="lazy" se non è già presente
        if (!element.hasAttribute('loading')) {
            element.setAttribute('loading', 'lazy');
        }
    });
}

// Crea un MutationObserver per rilevare l'aggiunta di nuovi elementi al DOM
const observer = new MutationObserver(() => {
    enableLazyLoading(); // Applica lazy loading ai nuovi elementi
});

// Configura l'observer per monitorare l'aggiunta di nuovi nodi nel body
observer.observe(document.body, {
    childList: true, // Rileva l'aggiunta di nuovi figli
    subtree: true     // Rileva modifiche in tutto il DOM, non solo nel corpo
});

// Esegui la funzione inizialmente per caricare i primi elementi
document.addEventListener('DOMContentLoaded', enableLazyLoading);

function goToPost(id) {
    if (id) {
      window.location.href = `/news/${id}`;
    }
  }

