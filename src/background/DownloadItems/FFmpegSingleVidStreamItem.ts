import { FFmpegDownloadData, FFmpegDownloadItem } from "./FFmpegDownloadItem";

export type FFmpegSingleVidStreamData = FFmpegDownloadData & {
    vidStreamNumber: number
}


export class FFmpegSingleVidStreamItem extends FFmpegDownloadItem {

    private vidStreamNumber: number;

    constructor(data: FFmpegSingleVidStreamData) {
        super(data);
        this.vidStreamNumber = data.vidStreamNumber;
    }

    async runFFmpegCommands(): Promise<void> {
        // const streams = this.deliveryInfo.Delivery.Streams;
        // const audioStreams = streams.filter(s => s.Tag === 'AUDIO');
        // const videoStreams = streams.filter(s => s.Tag !== "AUDIO");

        // const videoStream = videoStreams[this.vidStreamNumber];

        // if (!videoStream.StreamUrl) {
        //     throw Error('Unable to download stream. Stream URL not defined.');
        // }

        // const segment = videoStream.RelativeSegments && videoStream.RelativeSegments[0];

        // const startTime = segment?.Start;
        // const endTime = segment?.End;

        // const command = [
        //     startTime !== undefined ? '-ss' : undefined, startTime?.toString(),
        //     '-i', videoStream.StreamUrl,
        //     endTime !== undefined ? '-to' : undefined, endTime?.toString(),
        //     '-c', 'copy',
        //     '-bsf:a', 'aac_adtstoasc',
        //     this.finalFilename
        // ].filter(e => e !== undefined) as string[];

        // this.ffmpeg.run(...command);
    }

    calculateProgress(): number {
        return this.currentCommandProgress;
    }

    getStatus(): string {
        return 'Downloading';
    }

}