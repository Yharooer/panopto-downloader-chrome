function getVideoPreviewLink(id, hostname) {
    return `https://${hostname}/Panopto/Services/FrameGrabber.svc/FrameRedirect?objectId=${id}&mode=Delivery`;
}

function getVideoElementHTML(id, name, hostname) {
    return `
    <div class='video_element' id='video_element_${id}'>
      <div class='image_container' style='background-image: url(${getVideoPreviewLink(id, hostname)});'></div>
      <div class='text_container'>
        <p>${name}</p>
        <button>Download</button>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('github').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/Yharooer/panopto-downloader-chrome' });
    });
    chrome.tabs.executeScript({
        file: 'panoptodl.js'
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "DOWNLOAD") {
            chrome.downloads.download({ url: request.url, filename: request.filename });
        }
        if (request.action == 'VIEW') {
            var details = request.videoDetails;

            if (details == null || details.length == 0) {
                // Set view to no videos found.
                document.getElementById('loading').style.display = 'none';
                document.getElementById('not_detected').style.display = 'block';

                if (request.hostname.toLowerCase().includes('panopto.eu')) {
                    document.getElementById('is_panopto_url').style.display = 'block';
                }
                return;
            }

            // Add download all button if there is more than one video.
            if (details.length > 1) {
                const batch_dl_div = document.createElement('div');
                batch_dl_div.style.width = '100%';
                batch_dl_div.style.textAlign = 'center';
                const batch_dl_button = document.createElement('button');
                batch_dl_div.appendChild(batch_dl_button);
                batch_dl_button.innerText = `Download ${details.length} videos`;
                batch_dl_button.id = 'batch_download';
                batch_dl_button.addEventListener('click', () => {
                    chrome.tabs.executeScript({
                        code: `downloadMany();`
                    });
                });
                // Disabled copy links on right click.
                // batch_dl_button.addEventListener('contextmenu', e => {
                //   e.preventDefault();
                //   copyManyLinks(details.map(d => d.id), request.hostname);
                //   batch_dl_button.innerHTML = `${details.length} links copied!`;
                //   window.setTimeout(() => {
                //     batch_dl_button.innerHTML = `Download ${details.length} videos`;
                //   }, 2000);
                // });

                document.getElementById('downloader').appendChild(batch_dl_div);
            }
            document.getElementById('downloader').appendChild(document.createElement('hr'));

            // Add a download section for each video found.
            for (var i = 0; i < details.length; i++) {

                const div_el = document.createElement('div');
                div_el.classList.add('video_element');
                div_el.id = `video_element_${details[i].id}`;
                const div_im = document.createElement('div');
                div_im.classList.add('image_container');
                div_im.style.backgroundImage = `url(${getVideoPreviewLink(details[i].id, request.hostname)})`;
                div_el.appendChild(div_im);
                const div_txcnt = document.createElement('div');
                div_txcnt.classList = 'text_container';
                div_el.appendChild(div_txcnt);
                const p = document.createElement('p');
                p.innerHTML = details[i].name;
                div_txcnt.appendChild(p);
                const but = document.createElement('button');
                but.innerHTML = 'Download';
                const id = details[i].id;
                const name = details[i].name;
                but.addEventListener('click', () => {
                    chrome.tabs.executeScript({
                        code: `downloadSingle("${id.replace('"', '\\"')}", "${name.replace('"', '\\"').replace(/[<>:"\/\\|?*]/g, '')}");`
                    });
                });
                // Disabled copy link on right click.
                // but.addEventListener('contextmenu', e => {
                //   e.preventDefault();
                //   copyLink(id, request.hostname);
                //   but.innerHTML = 'Link copied!';
                //   window.setTimeout(() => {
                //     but.innerHTML = 'Download';
                //   }, 2000);
                // });
                div_txcnt.append(but);
                document.getElementById('downloader').appendChild(div_el);
                if (i + 1 < details.length) {
                    document.getElementById('downloader').appendChild(document.createElement('hr'));
                }
            }

            document.getElementById('loading').style.display = 'none';
            document.getElementById('downloader').style.display = 'block';
        }
    });

function copyLink(id, host) {
    const url = 'https://' + host + '/Panopto/Podcast/Social/' + id + '.mp4';
    navigator.clipboard.writeText(url);
}

function copyManyLinks(ids, host) {
    const urls = ids.map(id => 'https://' + host + '/Panopto/Podcast/Social/' + id + '.mp4');
    navigator.clipboard.writeText(urls.join('\n'));
}