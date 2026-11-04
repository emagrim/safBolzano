# SAF Bolzano 1953 – sito WordPress

Il sito è un tema + un plugin per WordPress standard. Il vecchio sito Node/Express è in `legacy/` (solo riferimento).

```
wp-content/
  themes/saf-bolzano/          aspetto: template, CSS, JS, immagini dei banner, menu
  plugins/saf-bolzano-data/    dati: staff, record sociali, lista atleti, numeri, modulo di iscrizione
content/
  documents/                   PDF (modulo di iscrizione, orari, calendario)
  gallery/                     foto della galleria (non in git, vedi sotto)
tools/scrape-atleti.js         scarica la lista atleti da atletica.me (serve un browser, fuori da WordPress)
docker-compose.yml             ambiente locale (WordPress + MariaDB + Mailpit)
legacy/                        vecchia app Node (contiene credenziali: vanno cambiate, vedi sotto)
```

## Provarlo in locale

```
docker compose up -d                 # http://localhost:8080  (email di prova: http://localhost:8025)
```

Completa l'installazione di WordPress, poi **Aspetto > Temi > SAF Bolzano 1953 > Attiva** e **Plugin > SAF Bolzano Data > Attiva**.
All'attivazione il tema crea le pagine (home, iscrizioni, atleti, staff, risultati, galleria, calendario, info, news), il menu principale, la home statica e i permalink `/nome-pagina/`; il plugin importa staff e record dal vecchio database.

## In produzione

1. Installa WordPress, copia `wp-content/themes/saf-bolzano` e `wp-content/plugins/saf-bolzano-data`, attivali.
2. Copia `content/` in `wp-content/uploads/saf/` (`documents/` e `gallery/`). La galleria è fatta di cartelle `AAAA.MM.GG_Nome evento/`: una cartella = un album.
3. Per le email di iscrizione configura un plugin SMTP (es. WP Mail SMTP). Le credenziali stanno nella configurazione di WordPress, non nel codice.

## Modificare i contenuti

| Cosa | Dove |
|---|---|
| Notizie | **Articoli > Aggiungi**. Compaiono in `/news/`. Per mostrare "News" nel menu: **Aspetto > Menu** |
| Staff | **Staff** (l'ordine si cambia con il campo "Ordine") |
| Record sociali | **Record sociali** |
| Numero di atleti, email che riceve le iscrizioni | **SAF** |
| Lista atleti | `cd tools && npm install && npx playwright install chromium && node scrape-atleti.js`, poi **SAF > Importa** (o `wp saf import-atleti atleti.json`) |
| Foto galleria / PDF | aggiungi cartelle o file in `wp-content/uploads/saf/` |
| Menu | **Aspetto > Menu** |

I testi fissi delle pagine (home, info, iscrizioni) sono nei template del tema (`page-*.php`, `front-page.php`).

## Sicurezza

In `legacy/` (e nella cronologia git) ci sono password e token: la password Gmail di `/send-email`, un token Instagram e un login Instagram in `routes/index.js`, le credenziali FTP in `ftp/ftp.txt`. Vanno cambiati.
