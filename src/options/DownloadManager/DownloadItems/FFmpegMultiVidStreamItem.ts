import { FFmpegDownloadData, FFmpegDownloadItem } from "./FFmpegDownloadItem";

export type FFmpegMultiVidStreamData = FFmpegDownloadData & {
    stack: "VERTICAL" | "HORIZONTAL";
}


export class FFmpegMultiVidStreamItem extends FFmpegDownloadItem {
    runFFmpegCommands(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    calculateProgress(): number {
        throw new Error("Method not implemented.");
    }
    getStatus(): string {
        throw new Error("Method not implemented.");
    }

}