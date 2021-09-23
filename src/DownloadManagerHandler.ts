import { v4 as uuid } from 'uuid';
import { DownloadManagerResponse, DownloadProgress } from './options/DownloadManager/DownloadManagerTypes';

const requestMap = new Map();

function onServiceWorkerMessage(event: MessageEvent) {
    const message = event.data as DownloadManagerResponse;

    const id = message.uuid;

    if (requestMap.has(id)) {
        const resolve = requestMap.get(id);
        requestMap.delete(id);
        resolve(message.response);
    }
}

export function initialiseDownloadManagerHandler() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/background.bundle.js", { scope: "/" })
            .then(function () {
                console.log("Service Worker Registered");
            });
    }

    navigator.serviceWorker.onmessage = onServiceWorkerMessage;
}

function postServiceWorker(data: any): Promise<any> {
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
    await postServiceWorker({ action: 'NEW', type, data });
}

export async function getDownloads(): Promise<DownloadProgress[]> {
    const { progress } = await postServiceWorker({ action: 'PROGRESS' });
    if (!progress) {
        throw new Error('Failed to get progress');
    }
    return progress;
}