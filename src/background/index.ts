/// <reference lib="WebWorker" />

import { ServiceWorkerMessage, DownloadManagerResponse, BgWorkerPageMessage, ChromeProxyResponse } from "../options/DownloadManager/DownloadManagerTypes";

export type { };
declare const self: ServiceWorkerGlobalScope;

let bgWorkerClientId: string | undefined;
let isWaitingForBgWorker = false;

// Post reply to all clients of service worker.
function replyToNonBgPageClients(uuid: string, response: any) {
    self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    }).then((clients) => {
        if (clients && clients.length) {
            clients.forEach(c => {
                if (c.id == bgWorkerClientId) {
                    return;
                }

                c.postMessage({ response, uuid } as DownloadManagerResponse);
            });
        }
    });
}

// Proxies to the background page worker.
const NO_BG_WORKER_ERROR = new Error('No background worker window found.')

async function proxyToBgPage(message: BgWorkerPageMessage) {
    if (!bgWorkerClientId) {
        throw NO_BG_WORKER_ERROR;
    }
    const client = await self.clients.get(bgWorkerClientId);
    if (!client) {
        throw NO_BG_WORKER_ERROR;
    }
    client.postMessage(message);
}

async function softProxyToBgPage(message: BgWorkerPageMessage) {
    try {
        await proxyToBgPage(message);
    }
    catch (e) {
        if (e != NO_BG_WORKER_ERROR) {
            throw e;
        }
    }
}


// Returns the current background worker tab if there is a background worker tab and it is ready.
// If it is not ready, wait until resolving.
// Else creates one and waits until it is ready before resolving.
function ensureBgWorkerExists(retries: number = 0): Promise<void> {
    return new Promise(async (resolve, reject) => {
        await waitForBgPageFinishCreated();

        if (bgWorkerClientId) {
            try {
                const client = await self.clients.get(bgWorkerClientId);
                if (client && client.url == chrome.runtime.getURL('bg_page.html')) {
                    await waitForBgPageClientHandshake();
                    resolve();
                    return;
                }
            }
            catch (e) { }
            bgWorkerClientId = undefined;
        }

        isWaitingForBgWorker = true;
        try {
            await createNewBgPage();
            isWaitingForBgWorker = false;
            resolve();
        }
        catch (e) {
            reject(e);
        }

    });
}

function createNewBgPage(retries: number = 0): Promise<void> {
    return new Promise(async (resolve, reject) => {
        bgWorkerClientId = undefined;
        await chrome.windows.create({ focused: false, height: 600, width: 400, type: 'popup', url: chrome.runtime.getURL('bg_page.html') });
        await waitForBgPageClientHandshake();
        resolve();
    });
}

function waitForBgPageClientHandshake(retries = 0): Promise<void> {
    return new Promise((resolve, reject) => {
        if (bgWorkerClientId) {
            resolve();
        }

        if (retries > 50) {
            reject(new Error('Timeout waiting for background worker to confirm creation.'));
            return;
        }

        setTimeout(async () => {
            try {
                await waitForBgPageClientHandshake(retries + 1);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        }, 100);
    });
}

function waitForBgPageFinishCreated(retries: number = 0): Promise<void> {
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
                await waitForBgPageFinishCreated(retries + 1);
                resolve();
            }
            catch (e) {
                reject(e);
            }
        }, 100);
    });
}

async function getChromeProxyResponse({ path, args }: { path: string[], args?: any[] }) {

    const NEEDS_CALLBACK = ['downloads.download', 'downloads.search'];

    let obj: any = chrome;
    for (let i = 0; i < path.length; i++) {
        if (obj[path[i]] !== undefined) {
            obj = obj[path[i]];
        }
        else {
            throw new Error(`Failed to get attribute. Cannot find ${['chrome', ...path.slice(0, i + 1)].join('.')}`);
        }
    }

    if (NEEDS_CALLBACK.includes(path.join('.'))) {
        return await new Promise((resolve, reject) => {
            try {
                obj(...[...(args || []), (arg1: any) => resolve(arg1)]);
            }
            catch(e) {
                reject(e);
            }
        });
    }
    else {
        const directResponse = !args || args.length == 0 ? obj() : obj(...args);
        const finalResponse = (directResponse instanceof Promise) ? await directResponse : directResponse;
        return finalResponse;
    }
}

async function onMessageAsync(event: ExtendableMessageEvent) {
    const message = event.data as ServiceWorkerMessage | DownloadManagerResponse;

    switch (message.action) {
        case 'RESPONSE':
            replyToNonBgPageClients(message.uuid, message.response);
            break;
        case 'CHROME_PROXY_REQUEST':
            try {
                const response = await getChromeProxyResponse(message);
                proxyToBgPage({ action: 'CHROME_PROXY_RESPONSE', uuid: message.uuid, response } as ChromeProxyResponse);
            }
            catch (e: any) {
                proxyToBgPage({ action: 'CHROME_PROXY_RESPONSE', uuid: message.uuid, error: e.message } as ChromeProxyResponse);
            }
            break;
        case 'INIT_BG_PAGE':
            if (!bgWorkerClientId && event.source && 'id' in event.source) {
                bgWorkerClientId = event.source.id;
                event.source.postMessage({ action: 'INIT_BG_RESP', uuid: message.uuid, result: true });
            }
            else if (event.source) {
                event.source.postMessage({ action: 'INIT_BG_RESP', uuid: message.uuid, result: false });
            }
            else {
                console.warn('Failed to reply to INIT_BG_PAGE event.');
            }
            break;
        case 'PROGRESS':
            try {
                await proxyToBgPage(message);
            }
            catch (e) {
                replyToNonBgPageClients(message.uuid, { progress: [] });
            }
            break;
        default:
            await ensureBgWorkerExists();
            await proxyToBgPage(message);
            break;
    }
}

self.onmessage = (event: ExtendableMessageEvent) => {
    onMessageAsync(event).then();
}