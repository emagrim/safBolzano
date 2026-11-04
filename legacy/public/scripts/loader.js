document.addEventListener('DOMContentLoaded', function () {
    function fetchData() {
      fetch('/api/010')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(homeOne => {
          console.log('Data received from server:', homeOne);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
  
          setTimeout(fetchData, 5000);
        });
    }
  
    // Initial fetch
    fetchData();
  });
  