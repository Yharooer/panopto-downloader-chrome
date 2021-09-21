let videoList = [];
let hostname;

/**
 * INITIALSIER CODE
 */

// Load list of video lectures.
document.addEventListener('DOMContentLoaded', async() => {
    document.getElementById('github').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://github.com/Yharooer/panopto-downloader-chrome' });
    });
    const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = currentTabs[0];
    chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ['scripts/scraper.js']
    });
});

/**
 * MESSAGING HANDLER
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == 'VIDEO_LIST') {
        videoList = request.videoDetails;
        hostname = request.hostname;

        if (videoList == null || videoList.length == 0) {
            // Set view to no videos found.
            document.getElementById('loading').style.display = 'none';
            document.getElementById('not_detected').style.display = 'block';

            if (request.hostname.toLowerCase().includes('panopto.eu') || request.hostname.toLowerCase().includes('panopto.com')) {
                document.getElementById('is_panopto_url').style.display = 'block';
            }
            return;
        }

        // Add download all button if there is more than one video.
        if (videoList.length > 1) {
            const batch_dl_div = document.createElement('div');
            batch_dl_div.style.width = '100%';
            batch_dl_div.style.textAlign = 'center';
            const batch_dl_button = createDownloadAllButton(`Download <span id='batch_dl_counter'>${videoList.length}</span> videos`);
            batch_dl_div.appendChild(batch_dl_button);
            batch_dl_button.id = 'batch_download';
            batch_dl_button.addEventListener('click', () => {
                quickDownloadMany(videoList);
            });
            document.getElementById('downloader').insertBefore(batch_dl_div, document.getElementById('downloader_list'));
        }

        // Add a download section for each video found.
        for (let i = 0; i < videoList.length; i++) {
            const divider = document.createElement('hr');
            divider.id = 'divider_before_' + videoList[i].id;
            document.getElementById('downloader_list').appendChild(divider);

            const div_el = document.createElement('div');
            div_el.classList.add('video_element');
            div_el.id = `video_element_${videoList[i].id}`;
            const div_im = document.createElement('div');
            div_im.classList.add('image_container');
            div_im.style.backgroundImage = `url(${getVideoPreviewLink(videoList[i].id, request.hostname)})`;
            div_el.appendChild(div_im);
            const div_txcnt = document.createElement('div');
            div_txcnt.classList = 'text_container';
            div_el.appendChild(div_txcnt);
            const p = document.createElement('p');
            p.innerHTML = videoList[i].name;
            div_txcnt.appendChild(p);
            const but = createMaterialButton('Download');
            but.addEventListener('click', () => {
                quickDownloadOne(videoList[i]);
            });
            div_txcnt.appendChild(but);
            const [overflowButton, overflowMenu] = createVideoMenuOverflow(videoList[i].id);
            div_txcnt.appendChild(overflowButton);
            div_txcnt.appendChild(overflowMenu);
            document.getElementById('downloader_list').appendChild(div_el);
        }
        document.getElementById('loading').style.display = 'none';
        document.getElementById('downloader').style.display = 'block';
    }

    // Disable remove button if only one video
    if (videoList.length <= 1) {
        disableRemoveOfLastVideo();
    }

});

function createMaterialButton(text) {
    const button = document.createElement('button');
    button.classList.add('mdc-button');
    const ripple = document.createElement('span');
    ripple.classList.add('mdc-button__ripple');
    const label = document.createElement('span');
    label.classList.add('mdc-button__label');
    label.innerHTML = text;
    button.setLabel = newText => label.innerHTML = newText;
    button.appendChild(ripple);
    button.appendChild(label);
    mdc.ripple.MDCRipple.attachTo(button);
    return button;
}

function createOutlinedMaterialButton(text) {
    const button = createMaterialButton(text);
    button.classList.add('mdc-button--outlined');
    return button;
}

function createDownloadAllButton(text) {
    const button = createOutlinedMaterialButton(text);
    const icon = document.createElement('i');
    icon.classList.add('material-icons');
    icon.classList.add('mdc-button__icon');
    icon.setAttribute('aria-hidden', "true");
    icon.innerHTML = 'download';
    button.getElementsByClassName('mdc-button__label')[0].prepend(icon);
    return button;
}

function createMaterialIconButton(iconLabel) {
    const button = document.createElement('button');
    button.classList.add('mdc-icon-button');
    button.classList.add('material-icons');
    button.innerHTML = iconLabel;
    mdc.ripple.MDCRipple.attachTo(button);
    return button;
}

function createMaterialMenuListItem(label) {
    const li = document.createElement('li');
    li.classList.add('mdc-list-item');
    li.setAttribute('role', 'menuitem');
    const ripple = document.createElement('span');
    ripple.classList.add('mdc-list-item__ripple');
    const text = document.createElement('span');
    text.classList.add('mdc-list-item__text');
    text.innerHTML = label;
    li.appendChild(ripple);
    li.appendChild(text);
    return li;
}

function createMaterialMenu(menuItems, anchorElement) {
    const div = document.createElement('div');
    div.classList.add('mdc-menu');
    div.classList.add('mdc-menu-surface');
    const ul = document.createElement('ul');
    ul.classList.add('mdc-list');
    ul.setAttribute('role', 'menu');
    ul.setAttribute('aria-hidden', 'true');
    ul.setAttribute('aria-orientation', 'vertical');
    ul.setAttribute('tabindex', '-1');
    div.appendChild(ul);

    for (let i = 0; i < menuItems.length; i++) {
        ul.appendChild(menuItems[i]);
    }

    const menu = new mdc.menu.MDCMenu(div);
    div.openMenu = () => menu.open = true;
    menu.setAnchorCorner(mdc.menu.Corner.BOTTOM_RIGHT);
    if (anchorElement != null) {
        menu.setAnchorElement(anchorElement);
    } else {
        console.warn('Failed to set anchor element for menu.');
    }
    return div;
}

function createVideoMenuOverflow(videoId) {
    const container = document.createElement('div');
    container.classList.add('video_overflow');
    const button = createMaterialIconButton('more_vert');
    container.appendChild(button);

    const removeButton = createMaterialMenuListItem('Remove');
    removeButton.classList.add('video_overflow_remove');
    removeButton.onclick = () => removeVideoFromList(videoId);
    // const customDlButton = createMaterialMenuListItem('Custom Download');
    // const menu = createMaterialMenu([removeButton, customDlButton], button);
    const menu = createMaterialMenu([removeButton], button);
    menu.classList.add('overflow_menu');
    button.addEventListener('click', () => menu.openMenu());

    return [container, menu];
}

/**
 * OVERFLOW MENU FUNCTIONALITY
 */

// Remove button
function disableRemoveOfLastVideo() {
    const removeButtons = document.getElementsByClassName('video_overflow_remove');
    for (let i = 0; i < removeButtons.length; i++) {
        removeButtons[i].classList.add('mdc-list-item--disabled');
    }
}

function removeVideoFromList(videoId) {
    // Remove from videoList.
    videoList = videoList.filter(v => v.id !== videoId);

    // Relabel download all button
    document.getElementById('batch_dl_counter').innerHTML = videoList.length;

    // Disable remove if there is only one video remaining.
    if (videoList.length <= 1) {
        const dlAllButton = document.getElementById('batch_download');
        if (dlAllButton != null) {
            dlAllButton.remove();
        }
        disableRemoveOfLastVideo();
    }

    // Transition out
    const listElement = document.getElementById('video_element_' + videoId);
    listElement.getElementsByClassName('image_container')[0].style.height = listElement.clientHeight + 'px';
    listElement.style.height = listElement.clientHeight + 'px';
    listElement.classList.add('transition_out');
    listElement.style.transform = 'scaleY(1)';
    listElement.style.opacity = '1';
    setTimeout(() => {
        listElement.style.height = '0px';
        listElement.style.transform = 'scaleY(0)';
        listElement.style.opacity = '0';
    }, 5);
    const divider = document.getElementById('divider_before_' + videoId);
    divider.style.transitionProperty = 'all';
    divider.style.transitionTimingFunction = 'ease-out';
    divider.style.transitionDuration = '0.25s';
    divider.style.marginTop = '0px';
    divider.style.marginBottom = '0px';

    setTimeout(() => {
        listElement.remove();
        divider.remove();
    }, 250);
}

/**
 * DOWNLOADING FUNCTIONALITY
 */

// Download one video in podcast form.
function quickDownloadOne(video) {
    const name = video.name;
    const id = video.id;
    // TODO instead will be given to Download Manager
    chrome.downloads.download({ url: getPodcastLink(id), filename: safeFileName(name + '.mp4') });
}

// Download many videos in podcast form.
function quickDownloadMany(vidList) {
    console.log(vidList);
    for (let i = 0; i < vidList.length; i++) {
        console.log(vidList[i]);
        quickDownloadOne(vidList[i]);
    }
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

/** 
 * FUNCTIONS TO GET URLS
 */
function getVideoPreviewLink(id) {
    return `https://${hostname}/Panopto/Services/FrameGrabber.svc/FrameRedirect?objectId=${id}&mode=Delivery`;
}

function getPodcastLink(id) {
    return `https://${hostname}/Panopto/Podcast/Social/${id}.mp4`;
}

function getDeliveryInfoLink() {
    return `https://${hostname}/Panopto/Pages/Viewer/DeliveryInfo.aspx`;
}