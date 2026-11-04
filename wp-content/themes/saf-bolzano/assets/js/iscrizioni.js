function toggleVisibility(name) {
    var elements = document.getElementsByClassName(name);
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = elements[i].style.display === "none" ? "block" : "none";
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('.formIscrizione');
    var button = document.querySelector('.submitIscrizione');
    var message = document.querySelector('.formMessage');
    if (!form || !button) return;

    function say(text, ok) {
        if (!message) return;
        message.textContent = text;
        message.style.color = ok ? 'green' : 'crimson';
    }

    button.addEventListener('click', function () {
        if (!form.reportValidity()) return;
        if (!window.confirm('Sei sicuro di inviare il modulo?')) return;

        var data = {};
        form.querySelectorAll('input, textarea').forEach(function (item) {
            var name = item.getAttribute('name');
            if (!name || item.type === 'file') return;
            data[name] = item.type === 'checkbox' ? item.checked : item.value;
        });

        button.disabled = true;
        fetch(safIscrizione.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                say('Modulo inviato! Ti abbiamo scritto una email di conferma.', true);
                form.reset();
            })
            .catch(function () {
                say('Errore nell\'invio del modulo. Riprova o contattaci.', false);
            })
            .then(function () { button.disabled = false; });
    });
});

window.addEventListener('scroll', translateTitles);
window.addEventListener('load', translateTitles);

function translateTitles() {
    document.querySelectorAll('.translate30px').forEach(function (element) {
        element.style.transform = window.scrollY === 0 ? 'none' : 'translateY(30px)';
    });
}

document.querySelectorAll('.beat').forEach(function (element) {
    element.addEventListener('mouseenter', function () {
        document.querySelectorAll('.beat').forEach(function (el) { el.classList.add('paused'); });
    });
    element.addEventListener('mouseleave', function () {
        document.querySelectorAll('.beat').forEach(function (el) { el.classList.remove('paused'); });
    });
});
