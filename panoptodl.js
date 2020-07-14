function downloadPage() {
	var name = null;
	try {
		name = document.getElementById('viewerHeader').getElementById('deliveryTitle').innerText;
	} catch (err) {
		name = null;
	}
	if (name == null) {
		name = document.title;
	}
	var urlParams = new URLSearchParams(window.location.search);
	var id = urlParams.get('id');
	if (id != null) {
		downloadSingle(id, name);
	}
}

function downloadMany() {
	var detailsTable = document.getElementById('detailsTable');

	if (detailsTable == null) {
		return;
	}

	var trs = detailsTable.getElementsByTagName('tr');

	var ids = [];
	var names = [];
	for (i=0; i<trs.length; i++) {
		var atags = Array.from(trs[i].getElementsByClassName('detail-cell')).map(dc => Array.from(dc.getElementsByTagName('a')));
		atags = flatten(atags);
		for (j=0; j<atags.length; j++) {
			url = atags[j].href;
			var urlParams = new URLSearchParams(url.split('?')[1]);
			var id = urlParams.get('id');
			if (!ids.includes(id) && id != null) {
				name = atags[j].innerText;
				ids.push(id);
				names.push(name);
			}
		}
	}

	for (i=0; i<ids.length; i++) {
		downloadSingle(ids[i], names[i]);
	}

}

function downloadSingle(id, name) {
	var host = window.location.hostname;
	var url = 'https://' + host + '/Panopto/Podcast/Social/' + id + '.mp4';
	console.log(name);
	chrome.runtime.sendMessage({action:"DOWNLOAD", url: url, filename: name + '.mp4'});
	//chrome.downloads.download({url: url, filename: name})
}

function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}

downloadPage();
downloadMany();