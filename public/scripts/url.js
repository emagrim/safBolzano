function sendURLToServer() {
    var currentURL = window.location.href;
    console.log(currentURL);

    fetch('/save-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentURL }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => {
        console.error('Error:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  var myParagraph = document.getElementById('submit');

  myParagraph.onclick = function() {
      sendURLToServer();
  };
});

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
            var comboField = document.getElementById(comboFieldId);
            comboField.selectedIndex = -1;
        }

        /*           function initializeDynamicBehavior() {
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
      
          window.onpopstate = initializeDynamicBehavior; */

        //RESET OPTIONS
        /*function resetComboField(comboFieldId) {
    var form = document.getElementById('myForm'); // Replace 'myForm' with the actual ID of your form
    form.reset();
}*/

        /*     <script>
        function initializeDynamicBehavior() {
            // List of combo box IDs
            var comboFieldIds = ['categoria', 'tipo', 'new_regione', 'livello'];

            // Function to generate the onclick attribute dynamically
            function generateOnClickAttribute() {
                var onclickValue = '';

                // Loop through combo box IDs and build the onclick attribute
                comboFieldIds.forEach(function (comboFieldId, index) {
                    onclickValue += 'resetComboField(\'' + comboFieldId + '\');';

                    // Add space after each function call except the last one
                    if (index < comboFieldIds.length - 1) {
                        onclickValue += ' ';
                    }
                });

                return onclickValue;
            }

            // Set the onclick attribute for the reset button
            document.getElementById('reset').setAttribute('onclick', generateOnClickAttribute());

            // Reset combo box function remains the same
            function resetComboField(comboFieldId) {
                var comboField = document.getElementById(comboFieldId);
                comboField.selectedIndex = -1;
            }

            // Submit button logic (replace this with your actual logic)
            var submitButton = document.getElementById('submit');

            submitButton.onclick = function () {
                // Add your submit button logic here
                console.log('Submit button clicked');
            };
        }

        // Call the initialize function when the page initially loads
        window.onload = initializeDynamicBehavior;

        // Call the initialize function when the link changes (you may need to adjust this based on your navigation logic)
        window.onpopstate = initializeDynamicBehavior;
    </script>

    const reset = `<script>
    document.addEventListener('DOMContentLoaded', function () {
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
            var comboField = document.getElementById(comboFieldId);
            comboField.selectedIndex = -1;
        }
    });
</script>`; */