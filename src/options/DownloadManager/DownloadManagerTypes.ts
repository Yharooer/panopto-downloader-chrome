import { ChromeDownloadData } from "./DownloadItems/ChromeDownloadItem";
import { FFmpegMultiVidStreamData } from "./DownloadItems/FFmpegMultiVidStreamItem";
import { FFmpegSingleVidStreamData } from "./DownloadItems/FFmpegSingleVidStreamItem";

// Response type
export type DownloadManagerResponse = {
    action: "RESPONSE"
    uuid: string
    response: any
}

// Query type
export type ServiceWorkerMessage = InitHandshakeRequest | NonHandshakeMessage;
export type BgWorkerPageMessage = InitHandshakeResponse | NonHandshakeMessage;

export type NonHandshakeMessage = ProgressDownloadManagerMessage | NewChromeDownloadManagerMessage | NewFFMpegSingleVidStreamManagerMessage | NewFFMpegMultiVidStreamManagerMessage | CancelDownload;

export type InitHandshakeRequest = {
    action: "INIT_BG_PAGE"
    uuid: string
    tabId: number
}

export type InitHandshakeResponse = {
    action: "INIT_BG_RESP"
    uuid: string
    result: boolean
}

export type ProgressDownloadManagerMessage = {
    action: "PROGRESS"
    uuid: string
}

export type NewChromeDownloadManagerMessage = {
    action: "NEW",
    type: "CHROME"
    data: ChromeDownloadData
    uuid: string
}

export type NewFFMpegSingleVidStreamManagerMessage = {
    action: "NEW"
    type: "FFMPEG_SINGLE"
    data: FFmpegSingleVidStreamData
    uuid: string
}

export type NewFFMpegMultiVidStreamManagerMessage = {
    action: "NEW"
    type: "FFMPEG_MULTI"
    data: FFmpegMultiVidStreamData
    uuid: string
}

export type CancelDownload = {
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