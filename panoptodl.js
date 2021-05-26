// Gets the id and name of the video on the page.
// Otherwise returns null.
function getOneVideo() {
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
        return {
            id: id,
            name: safeFileName(name)
        };
    }
    return null;
}

// Gets all the videos on the page.
// If this page does not contain a list of videos, returns null.
function getVideoSeries() {
    var details = [];

    // Helper function for processing a cell and getting the video id and name from it.
    // detailName is the class name of the div containing the titles.
    function processCell(cell, detailName) {
        const finds = [];

        // Get hyperlinks
        var atags = Array.from(cell.getElementsByClassName(detailName)).map(dc => Array.from(dc.getElementsByTagName('a')));
        atags = flatten(atags);

        // From each hyperlink process to see if url contains video id. If it does, add to list.
        for (j = 0; j < atags.length; j++) {
            url = atags[j].href;
            var urlParams = new URLSearchParams(url.split('?')[1]);
            var id = urlParams.get('id');
            if (!finds.map(d => d.id).includes(id) && id != null) {
                var name = atags[j].innerText;
                finds.push({
                    id: id,
                    name: safeFileName(name)
                });
            }
        }

        return finds;
    }

    // First parse detail view.
    var detailsTable = document.getElementById('detailsTable');
    if (detailsTable != null) {
        var trs = detailsTable.getElementsByTagName('tr');
        for (i = 0; i < trs.length; i++) {
            details = [...details, ...processCell(trs[i], 'detail-cell')];
        }
    }

    // Second parse grid view.
    const thumbnailGrid = document.getElementById('thumbnailGrid');
    if (thumbnailGrid != null) {
        const lis = thumbnailGrid.getElementsByTagName('li');
        for (i = 0; i < lis.length; i++) {
            details = [...details, ...processCell(lis[i], 'title-link')];
        }
    }

    // Third parse list view.
    const listTable = document.getElementById('listTable');
    if (listTable != null) {
        const trs = listTable.getElementsByTagName('tr');
        for (i = 0; i < trs.length; i++) {
            details = [...details, ...processCell(trs[i], 'title-link')];
        }
    }

    console.log(details);

    return arrayUniqueId(details);
}

// Gets the videos on the homepage.
// If this page does not contain any videos in the homepage-like layout
function getHomeVideos() {
    return Array.from(document.getElementsByClassName('item')).map(e => {
        try {
            return {
                id: e.id,
                name: e.getElementsByClassName('title-link')[0].getElementsByClassName('detail-title')[0].innerText
            }
        } catch (e) {
            return null;
        }
    }).filter(e => e != null && e.id != "" && e.id != null);
}

// Setup popup.
function setupPopup() {
    var singleDetails = getOneVideo();
    var bulkDetails = getVideoSeries() || [];

    var combined = arrayUniqueId([singleDetails, ...bulkDetails].filter(e => e != null));
    if (combined === undefined || combined.length == 0) {
        combined = arrayUniqueId(getHomeVideos());
    }

    chrome.runtime.sendMessage({
        action: "VIEW",
        videoDetails: combined,
        hostname: window.location.hostname
    });
}

// Downloads the video on this page.
function downloadPage() {
    var details = getOneVideo();
    if (details != null) {
        downloadSingle(details.id, details.name);
    }
}

// Download all videos on this page.
function downloadMany() {
    var details = getVideoSeries();
    for (i = 0; i < details.length; i++) {
        downloadSingle(details[i].id, details[i].name);
    }
}

// Downloads a single video given the video ID and its name.
function downloadSingle(id, name) {
    var host = window.location.hostname;
    var url = 'https://' + host + '/Panopto/Podcast/Social/' + id + '.mp4';
    chrome.runtime.sendMessage({ action: "DOWNLOAD", url: url, filename: name + '.mp4' });
}

function flatten(arr) {
    return arr.reduce(function(flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function arrayUniqueId(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i].id === a[j].id)
                a.splice(j--, 1);
        }
    }

    return a.filter(e => e != null);
}

// Makes a name safe to be a filename for Windows and Unix-based systems.
function safeFileName(filename) {
    filename = filename.replace(/[\/\\:*?<>]/g, ' ');
    filename = filename.replace('"', "'");
    while (filename.includes('..')) {
        filename = filename.replace('..', '');
    }
    return filename;
}

window.addEventListener('load', () => setupPopup());
setupPopup();