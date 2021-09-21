/// <reference lib="WebWorker" />

import { ChromeDownloadData, ChromeDownloadItem } from "./DownloadItems/ChromeDownloadItem";
import { DownloadItem } from "./DownloadItems/DownloadItem";
// import { FFmpegMultiVidStreamData, FFmpegMultiVidStreamItem } from "./DownloadItems/FFmpegMultiVidStreamItem";
// import { FFmpegSingleVidStreamData, FFmpegSingleVidStreamItem } from "./DownloadItems/FFmpegSingleVidStreamItem";
import { DownloadManagerQuery, DownloadManagerResponse, DownloadProgress } from "./DownloadManagerTypes";

export type { };
declare const self: ServiceWorkerGlobalScope;

function postReply(uuid: string, response: any) {
    self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
    }).then((clients) => {
        if (clients && clients.length) {
            clients.forEach(c => c.postMessage({ response, uuid } as DownloadManagerResponse));
        }
    });
}

const downloadItems: DownloadItem[] = [];

async function getProgress() {
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
    // console.log(data);
    let item;
    switch (type) {
        case "CHROME":
            item = new ChromeDownloadItem(data as ChromeDownloadData);
            downloadItems.push(item);
            await item.initialise();
            break;
        // case "FFMPEG_SINGLE":
        //     item = new FFmpegSingleVidStreamItem(data as FFmpegSingleVidStreamData);
        //     downloadItems.push(item);
        //     await item.initialise();
        //     break;
        // case "FFMPEG_MULTI":
        //     item = new FFmpegMultiVidStreamItem(data as FFmpegMultiVidStreamData);
        //     downloadItems.push(item);
        //     await item.initialise();
        //     break;
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

async function onMessageAsync(event: ExtendableMessageEvent) {
    const message = event.data as DownloadManagerQuery;

    switch (message.action) {
        case 'PROGRESS':
            const progresses = await getProgress();
            postReply(message.uuid, progresses);
            break;
        case 'NEW':
            await newDownload(message.type, message.data);
            break;
        case 'CANCEL':
            cancelDownload(message.data.downloadUuid);
            break;
    }
}

self.onmessage = (event: ExtendableMessageEvent) => {
    onMessageAsync(event).then();
}