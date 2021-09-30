import { v4 as uuid } from 'uuid';
import { ChromeDownloadData, ChromeDownloadItem } from './DownloadItems/ChromeDownloadItem';
import { DownloadItem } from "./DownloadItems/DownloadItem";
import { FFmpegMultiVidStreamData, FFmpegMultiVidStreamItem } from './DownloadItems/FFmpegMultiVidStreamItem';
import { FFmpegSingleVidStreamData, FFmpegSingleVidStreamItem } from './DownloadItems/FFmpegSingleVidStreamItem';
import { DownloadManagerResponse, DownloadProgress, InitHandshakeRequest, BgWorkerPageMessage } from "./DownloadManagerTypes";
import { handleResponse } from './utils/ChromeAPIProxy';

const downloadItems: DownloadItem[] = [];

export function postMessage(message: any) {
    window.parent.postMessage(message, window.location.origin);
}

function respond(uuid: string, response: any) {
    postMessage({ action: "RESPONSE", uuid, response } as DownloadManagerResponse);
}

export async function getProgress() {
    const downloadProgresses = await Promise.all(downloadItems.map(d => d.getProgress()));
    return downloadProgresses.sort((a: DownloadProgress, b: DownloadProgress) => {
        if (a.completed && !b.completed) {
            return -1;
        }

        if (b.completed && !a.completed) {
            return 1;
        }

        if (a.completed && b.completed) {
            if (!a.finishTime) {
                return 1;
            }
            if (!b.finishTime) {
                return -1;
            }

            return a.finishTime.getTime() - b.finishTime.getTime();
        }

        return a.startTime.getTime() - b.startTime.getTime();
    });
}

async function newDownload(type: string, data: any) {
    let item;
    switch (type) {
        case "CHROME":
            item = new ChromeDownloadItem(data as ChromeDownloadData);
            downloadItems.push(item);
            await item.initialise();
            break;
        case "FFMPEG_SINGLE":
            item = new FFmpegSingleVidStreamItem(data as FFmpegSingleVidStreamData);
            downloadItems.push(item);
            await item.initialise();
            break;
        case "FFMPEG_MULTI":
            item = new FFmpegMultiVidStreamItem(data as FFmpegMultiVidStreamData);
            downloadItems.push(item);
            await item.initialise();
            break;
    }
}

function cancelDownload(uuid: string) {
    const cancelItem = downloadItems.find(d => d.uuid === uuid);

    if (!cancelItem) {
        return;
    }

    cancelItem.terminate();

    const index = downloadItems.indexOf(cancelItem);
    if (index > -1) {
        downloadItems.slice(index, 1);
    }
}


async function onMessageAsync(event: MessageEvent) {
    const message = event.data as BgWorkerPageMessage;
    console.log(message);

    switch (message.action) {
        case "PROGRESS":
            const progress = await getProgress();
            respond(message.uuid, { progress });
            break;
        case 'NEW':
            newDownload(message.type, message.data);
            break;
        case 'CANCEL':
            cancelDownload(message.data.downloadUuid);
            break;
        case 'INIT_BG_RESP':
            if (message.uuid === handshakeReception.uuid && handshakeReception.uuid) {
                if (message.result && handshakeReception.resolve) {
                    handshakeReception.resolve();
                }
                else if (handshakeReception.reject) {
                    handshakeReception.reject();
                }
                handshakeReception.uuid = undefined;
                handshakeReception.resolve = undefined;
                handshakeReception.reject = undefined;
            }
            break;
        case 'CHROME_PROXY_RESPONSE':
            handleResponse(message);
            break;
    }

}

const handshakeReception: { uuid?: string, resolve?: () => void, reject?: () => void } = {};

function doInitialisationHandshake() {
    return new Promise<void>((resolve, reject) => {
        const handshakeUuid = uuid();
        handshakeReception.uuid = handshakeUuid;
        handshakeReception.resolve = resolve;
        handshakeReception.reject = reject;
        postMessage({ action: "INIT_BG_PAGE", uuid: handshakeUuid } as InitHandshakeRequest);
    });
}

export type DownloadManagerStatus = "READY" | "WAITING" | "REJECTED";

export function initialiseDownloadManager(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // TODO THIS ISN'T WORKING
        window.addEventListener('message', (event: MessageEvent) => onMessageAsync(event).then());

        // setTimeout(async () => {
        //     try {
        //         await doInitialisationHandshake();
        //         resolve(true);
        //     }
        //     catch (e) {
        //         resolve(false);
        //     }
        // }, 10000);

        if (document.readyState !== 'complete') {
            window.addEventListener('load', async () => {
                console.log(document.readyState);
                console.log(window.location.origin);
                try {
                    await doInitialisationHandshake();
                    resolve(true);
                }
                catch (e) {
                    resolve(false);
                }
            });
        }
        else {
            setTimeout(async () => {
                window.addEventListener('load', async () => {
                    console.log(document.readyState);
                    console.log(window.location.origin);
                    try {
                        await doInitialisationHandshake();
                        resolve(true);
                    }
                    catch (e) {
                        resolve(false);
                    }
                });
            }, 0);
        }
    });
}