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
| Record sociali | **Record sociali** (campo "Categoria": Donne o Uomini; il sito mostra prima la tabella Donne, poi Uomini) |
| Numero di atleti, email che riceve le iscrizioni | **SAF** |
| Lista atleti | si aggiorna da sola, vedi [Lista atleti](#lista-atleti) |
| Foto galleria / PDF | aggiungi cartelle o file in `wp-content/uploads/saf/` |
| Menu | **Aspetto > Menu** |

I testi fissi delle pagine (home, info, iscrizioni) sono nei template del tema (`page-*.php`, `front-page.php`).

## Lista atleti

La lista viene dalla pagina della società su [atletica.me](https://atletica.me/societa/211) e **si aggiorna da sola una volta al giorno**: il plugin scarica la pagina e importa gli atleti, poi ricalcola i numeri maschi/femmine (pagine Info e Iscrizioni).

- In wp-admin, menu **SAF**: data e risultato dell'ultimo aggiornamento, data del prossimo e il pulsante **Aggiorna ora**.
- Da riga di comando: `wp saf sync-atleti`.
- Se atletica.me non risponde o la sua pagina cambia, la lista attuale resta com'è e in **SAF** compare l'errore.
- L'aggiornamento usa WP-Cron, che parte quando qualcuno visita il sito: "una volta al giorno" vuol dire alla prima visita dopo 24 ore. Su un sito con poche visite si può far partire WP-Cron da un cron del server ([guida](https://developer.wordpress.org/plugins/cron/hooking-wp-cron-into-the-system-task-scheduler/)).

### Importazione manuale (alternativa)

Serve solo se l'aggiornamento automatico smette di funzionare. Lo script legge atletica.me con un browser vero e crea un file JSON.

**1. Creare il file JSON**

```
cd tools
nvm use 22.16
npm install                        # solo la prima volta
npx playwright install chromium    # solo la prima volta
node scrape-atleti.js atleti.json
```

Deve stampare qualcosa come `82 atleti scritti in atleti.json`.

**2. Importarlo in WordPress**

In wp-admin apri il menu **SAF** (c'è solo se il plugin "SAF Bolzano Data" è attivo), in "Importazione manuale" scegli `tools/atleti.json` e premi **Importa**.
In alternativa, da riga di comando: `wp saf import-atleti atleti.json`.

La pagina Atleti mostra la nuova lista e i numeri maschi/femmine (pagine Info e Iscrizioni) vengono ricalcolati.
Per aggiornare la lista basta ripetere i due passi: ogni importazione sostituisce quella precedente.

## Sicurezza

In `legacy/` (e nella cronologia git) ci sono password e token: la password Gmail di `/send-email`, un token Instagram e un login Instagram in `routes/index.js`, le credenziali FTP in `ftp/ftp.txt`. Vanno cambiati.
