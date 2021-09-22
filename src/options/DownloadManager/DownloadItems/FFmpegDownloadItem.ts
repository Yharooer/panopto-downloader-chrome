import { FFmpeg, createFFmpeg } from '@ffmpeg/ffmpeg';
import { PanoptoDeliveryInfo } from '../../../common/PanoptoDeliveryInfo';
import { filenameFromVideoName } from '../utils/filenameFromVideoName';
import { DownloadItem } from './DownloadItem';

export interface FFmpegDownloadData {
    hostname: string
    deliveryInfo: PanoptoDeliveryInfo
}

/*
 *  Usage: override runFFmpegCommands() to run your own FFMPEG command.
 *  eg: this.ffmpeg.run('-i', 'https://example.com/stream.m3u8', '-c' 'copy', 'final.mp4');
 * 
 *  The final file should be that set to finalFileName.
 */
export abstract class FFmpegDownloadItem extends DownloadItem {

    title: string;
    hostname: string;
    videoId: string;
    deliveryInfo: PanoptoDeliveryInfo;
    startTime: Date;
    ffmpeg: FFmpeg;

    endTime: Date | undefined;

    // Keep track of state.
    complete = false;
    private failed = false;

    private exportFilename: string;

    protected finalFilename = "final.mp4";
    protected currentCommandProgress: number = 0;

    // The FFmpeg commands to be run.
    abstract runFFmpegCommands(): Promise<void>;

    // Override: Calculate total progress (combining progress of multiple steps) and status.
    abstract calculateProgress(): number;
    abstract getStatus(): string;

    // Override: Estimate the amount of remaining time.
    calculateRemaining(): Date | undefined {
        return;
    }

    constructor(data: FFmpegDownloadData) {
        super();
        this.title = data.deliveryInfo.Delivery.SessionName;
        this.hostname = data.hostname;
        this.videoId = data.deliveryInfo.Delivery.PublicID;
        this.deliveryInfo = data.deliveryInfo;
        this.startTime = new Date();
        this.exportFilename = filenameFromVideoName(this.title);

        try {
            this.ffmpeg = createFFmpeg({
                log: true,
                progress: ({ ratio }) => this.currentCommandProgress = ratio,
                corePath: chrome.runtime.getURL('vendor/ffmpeg-core.js')
            });
        }
        catch (e) {
            this.failed = true;
            console.error('Failed to initialise FFmpeg.wasm.');
            throw e;
        }
    }

    async initialise(): Promise<void> {
        if (!this.ffmpeg) {
            this.failed = true;
            throw new Error('FFmpeg object is undefined, did createFFmpeg fail?');
        }

        try {
            await this.ffmpeg.load();
        }
        catch (e) {
            this.failed = true;
            console.error('FFmpeg failed to load.');
            throw e;
        }

        try {
            await this.runFFmpegCommands();
        }
        catch (e) {
            this.failed = true;
            console.error('FFmpeg commands failed to run.');
            throw e;
        }

        try {
            await this.saveFile();
        }
        catch (e) {
            this.failed = true;
            console.error('FFmpeg.wasm failed to save file.');
            throw e;
        }

        this.complete = true;
        this.endTime = new Date();
    }

    private async saveFile(): Promise<void> {
        if (!this.ffmpeg) {
            this.failed = true;
            throw new Error('FFmpeg object is undefined, did createFFmpeg fail?');
        }

        const array = this.ffmpeg.FS('readFile', this.finalFilename);
        const blob = new Blob([array.buffer]);
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({ url, filename: this.exportFilename });
    }

    async getProgress() {
        return {
            title: this.title,
            hostname: this.hostname,
            progress: this.calculateProgress(),
            status: this.complete ? 'Completed' : this.failed ? 'Failed' : this.getStatus(),
            estimatedFinish: this.calculateRemaining(),
            startTime: this.startTime,
            completed: this.complete,
            finishTime: this.complete ? this.endTime : undefined,
            uuid: this.uuid,
            videoId: this.videoId
        };
    }

    terminate(): void {
        if (!this.ffmpeg) {
            this.failed = true;
            throw new Error('FFmpeg object is undefined, did createFFmpeg fail?');
        }

        this.ffmpeg.exit();
    }

}