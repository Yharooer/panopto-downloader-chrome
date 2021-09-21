import { v4 as uuid } from 'uuid';
import { DownloadManagerResponse, DownloadProgress } from './background/DownloadManagerTypes';

const requestMap = new Map();

function onServiceWorkerMessage(event: MessageEvent) {
    const message = event.data as DownloadManagerResponse;

    const id = message.uuid;

    if (requestMap.has(id)) {
        const resolve = requestMap.get(id)
        requestMap.delete(id);
        resolve(message.response);
    }
}

export function initialiseDownloadManager() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/background.bundle.js", { scope: "/" })
            .then(function () {
                console.log("Service Worker Registered");
            });
    }

    navigator.serviceWorker.onmessage = onServiceWorkerMessage;
}

function postDownloadManager(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const id = uuid();
        if (!navigator.serviceWorker.controller) {
            reject('Service Worker not activated.');
        }

        requestMap.set(id, resolve);
        navigator.serviceWorker.controller?.postMessage({ uuid: id, ...data });
    });
}

export async function newDownload(type: string, data: any) {
    await postDownloadManager({ action: 'NEW', type, data });
}

export async function getDownloads(): Promise<DownloadProgress[]> {
    return await postDownloadManager({ action: 'PROGRESS' });
}