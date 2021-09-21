import { ChromeDownloadData } from "./DownloadItems/ChromeDownloadItem";
import { FFmpegMultiVidStreamData } from "./DownloadItems/FFmpegMultiVidStreamItem";
import { FFmpegSingleVidStreamData } from "./DownloadItems/FFmpegSingleVidStreamItem";

// Response type
export type DownloadManagerResponse = {
    uuid: string,
    response: any
}

// Query type
export type DownloadManagerQuery = ProgressDownloadManagerMessage | NewChromeDownloadManagerMessage | NewFFMpegSingleVidStreamManagerMessage | NewFFMpegMultiVidStreamManagerMessage | CancelDownload;

type ProgressDownloadManagerMessage = {
    action: "PROGRESS"
    uuid: string
}

type NewChromeDownloadManagerMessage = {
    action: "NEW",
    type: "CHROME"
    data: ChromeDownloadData
    uuid: string
}

type NewFFMpegSingleVidStreamManagerMessage = {
    action: "NEW"
    type: "FFMPEG_SINGLE"
    data: FFmpegSingleVidStreamData
    uuid: string
}

type NewFFMpegMultiVidStreamManagerMessage = {
    action: "NEW"
    type: "FFMPEG_MULTI"
    data: FFmpegMultiVidStreamData
    uuid: string
}

type CancelDownload = {
    action: "CANCEL",
    uuid: string,
    data: {
        downloadUuid: string
    }
}

// Progress Type
export type DownloadProgress = {
    title: string
    hostname: string
    progress: number
    estimatedFinish?: Date
    status: string
    startTime: Date
    finishTime?: Date
    completed: boolean
    videoId: string
    uuid: string
}

// export type DownloadProgress = IncompleteDownloadProgress | CompleteDownloadProgress;

// export type IncompleteDownloadProgress = {
//     title: string
//     hostname: string
//     progress: number
//     estimatedFinish?: Date
//     status: string
//     startTime: Date
//     completed: false,
//     videoId: string,
//     uuid: string
// }

// export type CompleteDownloadProgress = {
//     title: string
//     hostname: string
//     progress: number
//     estimatedFinish?: Date
//     status: string
//     startTime: Date
//     finishTime: Date,
//     completed: true,
//     videoId: string,
//     uuid: string
// }