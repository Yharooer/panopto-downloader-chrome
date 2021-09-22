import { DownloadProgress } from '../DownloadManagerTypes';
import { filenameFromVideoName } from '../utils/filenameFromVideoName';
import { DownloadItem } from './DownloadItem';

export interface ChromeDownloadData {
    title: string
    hostname: string
    videoId: string
    url: string
}

export class ChromeDownloadItem extends DownloadItem {

    private title: string;
    private hostname: string;
    private url: string;
    private videoId: string;
    private downloadId: number | undefined;

    // Used to get the start time when the download has not yet started.
    private initialiseTime : Date;

    constructor(data: ChromeDownloadData) {
        super();
        this.title = data.title;
        this.hostname = data.hostname;
        this.url = data.url;
        this.videoId = data.videoId;
        this.initialiseTime = new Date();
    }

    async initialise(): Promise<void> {
        const filename = filenameFromVideoName(this.title);
        const url = this.url;
        chrome.downloads.download({ url, filename }, (downloadId:number) => {
            this.downloadId = downloadId;
        });
    }

    async getProgress(): Promise<DownloadProgress> {
        return new Promise((resolve, reject) => {
            chrome.downloads.search({ id: this.downloadId }, (results: chrome.downloads.DownloadItem[]) => {
                if (results.length === 0) {
                    reject(`Failed to find download with id ${this.downloadId}.`)
                }

                const downloadItem = results[0];
                console.log(downloadItem);

                if (!downloadItem) {
                    resolve({
                        title: this.title,
                        hostname: this.hostname,
                        progress: 0,
                        status: 'Preparing Download',
                        startTime: this.initialiseTime,
                        completed: false,
                        uuid: this.uuid,
                        videoId: this.videoId
                    });
                    return;
                }
        
                if (downloadItem.paused) {
                    resolve( {
                        title: this.title,
                        hostname: this.hostname,
                        progress: downloadItem.bytesReceived / downloadItem.totalBytes,
                        status: 'Paused',
                        startTime: new Date(downloadItem.startTime),
                        completed: false,
                        uuid: this.uuid,
                        videoId: this.videoId
                    });
                    return;
                }
        
                if (downloadItem.state === 'interrupted') {
                    resolve({
                        title: this.title,
                        hostname: this.hostname,
                        progress: downloadItem.bytesReceived / downloadItem.totalBytes,
                        status: 'Interrupted',
                        startTime: new Date(downloadItem.startTime),
                        completed: false,
                        uuid: this.uuid,
                        videoId: this.videoId
                    });
                    return;
                }
        
                if (downloadItem.state === 'complete') {
                    resolve({
                        title: this.title,
                        hostname: this.hostname,
                        progress: downloadItem.bytesReceived / downloadItem.totalBytes,
                        status: 'Complete',
                        startTime: new Date(downloadItem.startTime),
                        finishTime: downloadItem.endTime ? new Date(downloadItem.endTime) : new Date(),
                        completed: true,
                        uuid: this.uuid,
                        videoId: this.videoId
                    });
                    return;
                }
        
                resolve({
                    title: this.title,
                    hostname: this.hostname,
                    progress: downloadItem.bytesReceived / downloadItem.totalBytes,
                    status: 'Downloading',
                    estimatedFinish: downloadItem.estimatedEndTime ? new Date(downloadItem.estimatedEndTime) : undefined,
                    startTime: new Date(downloadItem.startTime),
                    completed: false,
                    uuid: this.uuid,
                    videoId: this.videoId
                });
            });
        });
    }

    terminate(): void {
        this.downloadId && chrome.downloads.cancel(this.downloadId);
    }

}