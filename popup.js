document.addEventListener('DOMContentLoaded', function() {
        thebutton = document.getElementById('thebutton');
        thebutton.addEventListener('click', function() {
          chrome.tabs.executeScript({
            file: 'panoptodl.js'
          });
        });
     });

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log('message received.')
		if (request.action == "DOWNLOAD"){
			chrome.downloads.download({url: request.url, filename: request.filename});
		}
	})