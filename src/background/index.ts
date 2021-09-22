/// <reference lib="WebWorker" />

import { ServiceWorkerMessage, DownloadManagerResponse, BgWorkerPageMessage } from "../options/DownloadManager/DownloadManagerTypes";

export type { };
declare const self: ServiceWorkerGlobalScope;

let bgWorkerTabId: number | undefined;
let isWaitingForBgWorker = false;
let bgWorkerIsReady = false;

// Post reply to all clients of service worker.
function replyToClients(uuid: string, response: any) {
    self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    }).then((clients) => {
        if (clients && clients.length) {
            clients.forEach(c => c.postMessage({ response, uuid } as DownloadManagerResponse));
        }
    });
}

// Proxies to the background page worker.
const NO_BG_WORKER_ERROR = new Error('No background worker window found.')

function proxyToWorker(message: BgWorkerPageMessage) {
    if (!bgWorkerTabId) {
        throw NO_BG_WORKER_ERROR;
    }
    chrome.tabs.sendMessage(bgWorkerTabId, message);
}

function softProxyToWorker(message: BgWorkerPageMessage) {
    try {
        proxyToWorker(message);
    }
    catch(e) {
        if (e != NO_BG_WORKER_ERROR) {
            throw e;
        }
    }
}


// Returns the current background worker tab if there is a background worker tab and it is ready.
// If it is not ready, wait until resolving.
// Else creates one and waits until it is ready before resolving.
function ensureBgWorkerExists(retries: number = 0): Promise<number | undefined> {
    return new Promise(async (resolve, reject) => {
        await waitForBgWorkerCreation();

        if (bgWorkerTabId) {
            try {
                const tab = await chrome.tabs.get(bgWorkerTabId);
                if (tab.url == chrome.runtime.getURL('options.html')) {
                    await waitForReadyBgWorkerInit();
                    resolve(bgWorkerTabId);
                    return;
                }
            }
            catch(e) {}
            bgWorkerTabId = undefined;
            bgWorkerIsReady = false;
        }

        isWaitingForBgWorker = true;
        bgWorkerIsReady = false;
        try {
            bgWorkerTabId = await createNewBgWorkerPage();
            isWaitingForBgWorker = false;
            await waitForReadyBgWorkerInit();
            resolve(bgWorkerTabId);
        }
        catch (e) {
            reject(e);
        }

    });
}

function createNewBgWorkerPage(retries: number = 0): Promise<number> {
    return new Promise(async (resolve, reject) => {
        const window = await chrome.windows.create({ focused: false, height: 600, width: 400, type: 'popup', url: chrome.runtime.getURL('options.html') });
        if (!window.id) {
            reject(new Error('Failed to get id of newly created background worker window.'));
            return;
        }
        await waitForTabToLoad(window.id);
        const tab = window.tabs?.filter(t => t.url || t.pendingUrl == chrome.runtime.getURL('options.html'));
        if (!tab || tab.length == 0) {
            if (retries < 10) {
                const tabId = await createNewBgWorkerPage(retries + 1);
                resolve(tabId);
                return;
            }
            reject(new Error('Failed to create background worker window.'));
            return;
        }
        const tabId = tab[0].id;
        if (tabId) {
            resolve(tabId);
        }
        else {
            reject(new Error('Error getting id of background worker window tab.'));
        }
    });
}

function waitForTabToLoad(windowId: number, retries = 0): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const window = await chrome.windows.get(windowId, {populate: true});
        const completeTabs = window.tabs?.filter(t => t.status === 'complete');
        if (completeTabs && completeTabs.length > 0) {
            resolve();
        }

        if (retries > 50) {
            reject(new Error('Timeout waiting for background worker window to load tabs.'));
            return;
        }

        setTimeout(async () => {
            try {
                await waitForTabToLoad(windowId, retries + 1);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        }, 100);
    });
}

function waitForBgWorkerCreation(retries: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
        if (!isWaitingForBgWorker) {
            resolve();
        }

        if (retries > 50) {
            reject(new Error('Timeout waiting for background worker to be created.'));
            return;
        }

        setTimeout(async () => {
            try {
                await waitForBgWorkerCreation(retries + 1);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        }, 100);
    });
}

function waitForReadyBgWorkerInit(retries: number = 0): Promise<void> {
    return new Promise((resolve, reject) => {
        if (bgWorkerIsReady) {
            resolve();
        }

        if (retries > 50) {
            reject(new Error('Timeout waiting for background worker to be ready.'));
            return;
        }

        setTimeout(async () => {
            try {
                await waitForReadyBgWorkerInit(retries + 1);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        }, 100);
    });
}


async function onMessageAsync(event: ExtendableMessageEvent) {
    const message = event.data as ServiceWorkerMessage | DownloadManagerResponse;
    
    switch (message.action) {
        case 'RESPONSE':
            replyToClients(message.uuid, message.response);
            break;
        case 'INIT_BG_PAGE':
            await waitForBgWorkerCreation();
            if (message.tabId === bgWorkerTabId) {
                bgWorkerIsReady = true;
            }
            chrome.tabs.sendMessage(message.tabId, { action: 'INIT_BG_RESP', uuid: message.uuid, result: message.tabId === bgWorkerTabId });
            break;
        case 'PROGRESS':
            softProxyToWorker(message);
            break;
        default:
            await ensureBgWorkerExists();
            proxyToWorker(message);
            break;
    }
}

self.onmessage = (event: ExtendableMessageEvent) => {
    onMessageAsync(event).then();
}