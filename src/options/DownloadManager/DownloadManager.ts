import { v4 as uuid } from 'uuid';
import { ChromeDownloadData, ChromeDownloadItem } from './DownloadItems/ChromeDownloadItem';
import { DownloadItem } from "./DownloadItems/DownloadItem";
import { FFmpegMultiVidStreamData, FFmpegMultiVidStreamItem } from './DownloadItems/FFmpegMultiVidStreamItem';
import { FFmpegSingleVidStreamData, FFmpegSingleVidStreamItem } from './DownloadItems/FFmpegSingleVidStreamItem';
import { DownloadManagerResponse, DownloadProgress, InitHandshakeRequest, BgWorkerPageMessage } from "./DownloadManagerTypes";

const downloadItems: DownloadItem[] = [];

function respond(uuid: string, response: any) {
    navigator.serviceWorker.controller?.postMessage({ action: "RESPONSE", uuid, response } as DownloadManagerResponse);
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
    console.log(data);
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


async function onMessageAsync(message: BgWorkerPageMessage) {
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
    }

}

const handshakeReception: { uuid?:string, resolve?: ()=>void, reject?: ()=>void } = {};

function doInitialisationHandshake() {
    return new Promise<void>(async (resolve, reject) => { 
        const thisTab = await chrome.tabs.getCurrent();
        const handshakeUuid = uuid();
        handshakeReception.uuid = handshakeUuid;
        handshakeReception.resolve = resolve;
        handshakeReception.reject = reject;
        navigator.serviceWorker.controller?.postMessage({ action: "INIT_BG_PAGE", uuid: handshakeUuid, tabId: thisTab.id } as InitHandshakeRequest);
    });
}

export type DownloadManagerStatus = "READY" | "WAITING" | "REJECTED";

export async function initialiseDownloadManager() {
    chrome.runtime.onMessage.addListener((message: any) => onMessageAsync(message).then());
    
    // TODO debug
    // window.getDownloadProgress = getProgress;

    try {
        await doInitialisationHandshake();
        return true;
    }
    catch (e) {
        return false;
    }
}