import { AppBar, Button, Dialog, Fade, FormControl, FormControlLabel, FormLabel, Grid, IconButton, Radio, RadioGroup, Slide, Toolbar, Typography } from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { ChangeEvent, useMemo, useState } from 'react';
import './DownloadInitialiserDialog.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PanoptoDeliveryInfo, PanoptoStream } from '../../common/PanoptoDeliveryInfo';
import { useCallback } from 'react';
import AnimateHeight from 'react-animate-height';
import { newDownload } from '../../DownloadManagerHandler';
import { FFmpegMultiVidStreamData } from '../../background/DownloadItems/FFmpegMultiVidStreamItem';
import { FFmpegSingleVidStreamData } from '../../background/DownloadItems/FFmpegSingleVidStreamItem';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="left" ref={ref} {...props} />;
});

type DownloadInitialiserOption = {
    heading: string;
    subtitle: string | null;
    detailElement: JSX.Element;
    type: string;
} | null;

const PodcastModeOption = ({ responseData, hostname }: { responseData: PanoptoDeliveryInfo, hostname: string }): DownloadInitialiserOption => {
    const podcastUrl = responseData.DownloadUrl;

    const onClick = useCallback(() => {
        newDownload('CHROME', {
            title: responseData.Delivery.SessionName,
            videoId: responseData.Delivery.PublicID,
            hostname: hostname,
            url: podcastUrl
        });
    }, [responseData, podcastUrl, hostname]);

    // TODO in the future check if the old method works.

    if (!podcastUrl) {
        return null;
    }

    const numStreams = responseData.Delivery?.Streams?.filter((stream: PanoptoStream) => stream.Tag !== "AUDIO").length;

    return {
        heading: "Podcast Mode",
        subtitle: (numStreams <= 2)
            ? "Recommended and fastest method."
            : `Not recommended. May not display all streams.`,
        detailElement: (<Button variant="contained" color="primary" onClick={onClick}>Download</Button>),
        type: "podcast"
    }

}

// TODO some videos have many streams but they don't overlap...
const SingleStreamOptions = ({ responseData, hostname }: { responseData: PanoptoDeliveryInfo, hostname: string }): DownloadInitialiserOption[] => {
    const videoStreams = responseData.Delivery.Streams.filter((stream: PanoptoStream) => stream.Tag !== "AUDIO");
    const streamOptions = videoStreams.map((stream: PanoptoStream, index: number) => {

        const onClick = () => {
            newDownload('FFMPEG_SINGLE', {
                hostname,
                deliveryInfo: responseData,
                vidStreamNumber: 0
            } as FFmpegSingleVidStreamData);
        };

        return {
            heading: (videoStreams.length === 1)
                ? "Custom Video Download"
                : `Video Stream ${index + 1} of ${videoStreams.length}`,
            subtitle: (videoStreams.length === 1)
                ? "Slower method; downloads in original quality."
                : `Only downloads a single stream.`,
            detailElement: (<Button variant="contained" color="primary" onClick={onClick}>Download</Button>),
            type: `singlestream_${index + 1}`
        }
    });

    if (videoStreams.length > 1) {
        streamOptions.push({
            heading: `All Individual Streams`,
            subtitle: `Downloads all ${videoStreams.length} streams individually into separate files.`,
            detailElement: (<p>Detail element for downloading all streams individually.</p>),
            type: 'singlestream_individual'
        });
    }

    return streamOptions;
}

const CombinedStreamOptions = ({ responseData, hostname }: { responseData: PanoptoDeliveryInfo, hostname: string }): DownloadInitialiserOption[] => {
    const videoStreams = responseData.Delivery.Streams.filter((stream: PanoptoStream) => stream.Tag !== "AUDIO");

    const streamOptions: DownloadInitialiserOption[] = [];

    if (videoStreams.length > 1) {
        streamOptions.push({
            heading: `Tile Streams Horizontally`,
            subtitle: `Slow. Combines ${videoStreams.length === 2 ? 'both' : 'all'} streams into one file by tiling them horizontally.`,
            detailElement: (<p>Detail element for tiling streams horizontally.</p>),
            type: 'combinedstream_horizontal'
        });

        streamOptions.push({
            heading: `Tile Streams Vertically`,
            subtitle: `Slow. Combines ${videoStreams.length === 2 ? 'both' : 'all'} streams into one file by tiling them vertically.`,
            detailElement: (<p>Detail element for tiling streams vertically.</p>),
            type: 'combinedstream_vertical'
        });
    }

    if (videoStreams.length === 2) {
        streamOptions.push({
            heading: `Picture-in-Picture`,
            subtitle: `Slow. Combines both streams and embeds the second stream into a smaller frame.`,
            detailElement: (<p>Detail element for tiling streams picture in picture.</p>),
            type: 'combinedstream_picture_in_picture'
        });
    }

    return streamOptions;
}


const DownloadInitialiserDialog = ({ open, handleClose, responseData, hostname }: { open: boolean, handleClose: () => void, responseData: PanoptoDeliveryInfo, hostname: string }) => {
    const [radioValue, setRadioValue] = useState('');

    const videoName = responseData.Delivery.SessionName;

    const podcastModeOption = PodcastModeOption({ responseData, hostname });
    const singleStreamOptions = SingleStreamOptions({ responseData, hostname });
    const combinedStreamOptions = CombinedStreamOptions({ responseData, hostname });
    const options: DownloadInitialiserOption[] = useMemo(() => [podcastModeOption, ...singleStreamOptions, ...combinedStreamOptions], [podcastModeOption, singleStreamOptions, combinedStreamOptions]);

    const optionsMapper = useMemo(() => Object.assign({}, ...options.filter(op => op != null && op.type != null).map(op => ({ [op?.type as string]: op }))), [options]);

    const onRadioChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setRadioValue(event.target.value);
    }, [])

    // TODO if there is only one type of option - just show that option.
    return (
        <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                        size="large">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography className="ToolbarTitle" variant="h6">
                        {videoName}
                    </Typography>
                </Toolbar>
            </AppBar>

            <div style={{ padding: 16 }}>
                <Button onClick={() => console.log(responseData)} variant="outlined">console.log Delivery Info</Button>
            </div>

            <Grid container style={{ padding: 16 }}>
                <FormControl component="fieldset">
                    <FormLabel>Download Mode</FormLabel>
                    <RadioGroup value={radioValue} onChange={onRadioChange}>
                        {options.filter(op => op !== null)
                            .map(op =>
                            (<FormControlLabel
                                key={op?.type}
                                value={op?.type}
                                control={<Radio color="primary" />}
                                label={<>
                                    <Typography>
                                        {op?.heading}
                                    </Typography>
                                    {op?.subtitle &&
                                        <AnimateHeight duration={200} height={radioValue === op?.type ? 'auto' : 0}>
                                            <Typography className={`subtitle`}>
                                                {op?.subtitle}
                                            </Typography>
                                        </AnimateHeight>}
                                </>} />)
                            )
                        }
                    </RadioGroup>
                </FormControl>
                {options.filter(op => op !== null).map((op, index) => (
                    <div key={index} style={{ overflow: 'hidden' }}>
                        <Fade in={radioValue === op?.type}>
                            <Slide direction="up" in={radioValue === op?.type} mountOnEnter unmountOnExit>
                                <Grid className="detailContainer" container>
                                    {op?.detailElement}
                                </Grid>
                            </Slide>
                        </Fade>
                    </div>
                ))}
            </Grid>
        </Dialog>
    );
};

export default DownloadInitialiserDialog;
