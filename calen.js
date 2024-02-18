const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const website = 'https://www.fidal.it/calendario.php';
    await page.goto(website, { waitUntil: 'domcontentloaded' });

    let sectionHtml = await page.$eval('.section', section => section.innerHTML);

    const url = req.protocol + '://' + req.get('host') + req.originalUrl;

    const parts = url.split('?');
    const secondPartLink = parts[1];
    const fullLink = website + '?' + secondPartLink;
    const stdOut = `<p>URL: ${fullLink}</p>`;

    await page.goto(fullLink, {waitUntil: 'domcontentloaded'});
    sectionHtml = await page.$eval('.section', section => section.innerHTML);

    const reset = `    <script>
    function initializeDynamicBehavior() {
        var comboFieldIds = ['categoria', 'tipo', 'new_regione', 'livello'];

        function generateOnClickAttribute() {
            var onclickValue = '';

            comboFieldIds.forEach(function (comboFieldId, index) {
                onclickValue += 'resetComboField(\'' + comboFieldId + '\');';

                if (index < comboFieldIds.length - 1) {
                    onclickValue += ' ';
                }
            });

            return onclickValue;
        }

        document.getElementById('reset').setAttribute('onclick', generateOnClickAttribute());

        function resetComboField(comboFieldId) {
          var comboField = document.getElementById(comboFieldId);s
          var clone = comboField.cloneNode(true); // Clone the original combo box

    // Replace the existing combo box with the clone
    comboField.parentNode.replaceChild(clone, comboField);

    // Remove the clone (optional, depends on your use case)
    // This step ensures that the clone doesn't interfere with form submission
    setTimeout(function () {
        clone.parentNode.replaceChild(comboField, clone);
    }, 0);
        }

        var submitButton = document.getElementById('submit');

        submitButton.onclick = function () {
            console.log('Submit button clicked');
        };
    }

    window.onload = initializeDynamicBehavior;

    window.onpopstate = initializeDynamicBehavior;
</script>`;

    const output = sectionHtml + stdOut + reset;
    res.send(output);

    await browser.close();
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
