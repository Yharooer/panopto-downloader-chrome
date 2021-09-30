const iframe = document.getElementById("sandbox_iframe");

let hasReceivedReadySignal = false;

function waitForReady() {
    return new Promise((resolve, reject) => {
        if (hasReceivedReadySignal) {
            resolve();
            return;
        }

        setTimeout(async () => {
            await waitForReady();
            resolve();
        }, 100);
    });  
}

async function onMessageRecieveAsync(event) {
    console.log('inwards');
    console.log(event.data);
    await waitForReady();
    iframe.contentWindow.postMessage(event.data, '*');
}

navigator.serviceWorker.addEventListener('message', (event) => onMessageRecieveAsync(event).then());

window.addEventListener('message', (event) => {
    console.log('outwards');
    console.log(event.data);

    if (event.data.action === "INIT_BG_PAGE") {
        hasReceivedReadySignal = true;
    }

    navigator.serviceWorker.controller.postMessage(event.data);
});