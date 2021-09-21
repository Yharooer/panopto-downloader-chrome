export interface PanoptoDeliveryInfo {
    AllowPublicNotes: boolean
    BroadcastRefreshInterval: number
    BroadcastSegmentBackoff: number
    CompletionPercentage: number
    Delivery: PanoptoDeliveryData
    DownloadUrl?: string
    EmbedUrl: string
    InvocationId: uuid
    LastViewingPosition: number
    PodcastCompleted: true
    SessionId: uuid
    SessionRole: 2
    UserCanCreateQuestionLists: true
    UserEmail: string
    UserId: uuid
    UserKey: string
    UserName: string
    UserRating: unknown
    ViewerFileId: uuid
    WebcastPingIntervalInSeconds: number
}

export interface PanoptoDeliveryData {
    AllowPublishNotes: boolean
    AvailableLanguages: number[]
    AverageRating: number
    BroadcastEnded: boolean
    BroadcastInterrupted: boolean
    BroadcastType: number
    Contributors: { Bio: string, DisplayName: string, UserKey: string }[]
    DisableSeekOnFirstView: unknown
    DiscussionEnabled: boolean
    Duration: number
    EventTargets: unknown[]
    FirstQuizOffset: number
    HasAnyLinks: boolean
    HasCaptions: boolean
    HasQuiz: boolean
    HasSplices: boolean
    Identifier: string
    IsActiveBroadcast: boolean
    IsAudioPodcastEncodeComplete: boolean
    IsBroadcast: boolean
    IsOpen: boolean
    IsPodcastEncodeComplete: boolean
    IsPrimaryAudioOnly: boolean
    IsPurgedEncode: boolean
    IsPurgedLegacyEncode: boolean
    IsReadyForEditing: boolean
    IsStarted: boolean
    IsTabletEncodeComplete: boolean
    IsViewerEncodeAvailable: boolean
    IsViewerEncodeComplete: boolean
    NextDeliveryDescription: unknown
    NextDeliveryDuration: number
    NextDeliveryId: unknown
    NextDeliveryIsLive: boolean
    NextDeliveryThumbUrl: unknown
    NextDeliveryTitle: unknown
    NextDeliveryUrl: unknown
    NormalizeVolume: boolean
    OwnerBio: unknown
    OwnerDisplayName: string
    OwnerId: uuid
    OwnerIsOverQuota: boolean
    Permissions: boolean[]
    PodcastStreams?: PanoptoStream[]
    PublicID: uuid
    PublicNotesStreams: unknown[]
    RatingCount: number
    RehydrationAvailable: boolean
    RequiresAdvancedEditor: boolean
    SessionAbstract: string
    SessionFileId: uuid
    SessionGroupAbstract: string | null
    SessionGroupLongName: string
    SessionGroupPublicID: uuid
    SessionGroupShortName: string | null
    SessionName: string
    SessionPublicID: uuid
    SessionStartTime: number
    Streams: PanoptoStream[]
    Tags: string[]
    Timestamps: PanoptoTimestamp[]
    WebcastVersionId: unknown

}

export interface PanoptoStream {
    AbsoluteEnd: number
    AbsoluteStart: number
    BroadcastType: number
    EditMediaFileType: number | null
    EditMediaFileTypeLegacy: unknown | null
    EditMediaFileTypeName: "hls" | null
    Interrupted: boolean
    Name: string | null
    PublicID: uuid
    RelativeEnd: number
    RelativeSegments: PanoptoStreamSegment[] | null
    RelativeStart: number
    SourceMediaFileType: number
    StreamFileId: uuid
    StreamHttpUrl: string | null
    StreamType: 1 | 2       // TODO others?
    StreamTypeName: "Streaming" | "Archival"
    StreamUrl: string | null
    Tag: "AUDIO" | "SCREEN" | "OBJECT" | "DV"
    VRType: number
    ViewerMediaFileType: number
    ViewerMediaFileTypeName: "hls"
}

export interface PanoptoStreamSegment {
    Start: number
    End: number
    Offset: number | null
    RelativeStart: number | null
    StreamPublicId?: uuid
}

export interface PanoptoTimestamp {
    AbsoluteTime: number
    Caption: string | null
    CreatedDuringWebcast: boolean
    CreationDateTime: unknown
    CreationTime: number
    Data: unknown | null
    EventTargetType: string
    ID: number
    IsQuestionList: boolean
    IsSessionPlaybackBlocking: boolean
    ObjectIdentifier: string
    ObjectPublicIdentifier: uuid
    ObjectSequenceNumber: string
    ObjectStreamID: uuid
    PublicId: uuid
    SessionID: uuid
    Time: number
    Url: unknown | null
    UserDisplayName: unknown | null
    UserInvocationRequiredInUrl: boolean
    UserName: string
}

type uuid = string;