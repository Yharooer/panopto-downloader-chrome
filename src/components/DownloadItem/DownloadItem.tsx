import { Grid, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';
import { DownloadProgress } from '../../background/DownloadManagerTypes';
import { RelativeTimeComponent } from '../../utils/RelativeTimeComponent';
import './DownloadItem.css';

export const DownloadItem = ({ progress }: { progress: DownloadProgress }) => {
    if (progress.completed) {
        return (
            <>
                <Grid container className="DownloadItem">
                    <div className="ImageContainer" style={{ backgroundImage: `url(https://${progress.hostname}/Panopto/Services/FrameGrabber.svc/FrameRedirect?objectId=${progress.videoId}&mode=Delivery)` }} />
                    <Grid item className="TextContainer">
                        <Typography className="TitleText" variant="body2">{progress.title}</Typography>
                        <Typography variant="body1">Completed {progress.finishTime && <RelativeTimeComponent date={progress.finishTime} complete={true} />}</Typography>
                    </Grid>
                </Grid>
                <hr />
            </>
        )
    }

    return (
        <>
            <Grid container className="DownloadItem">
                <div className="ImageContainer" style={{ backgroundImage: `url(https://${progress.hostname}/Panopto/Services/FrameGrabber.svc/FrameRedirect?objectId=${progress.videoId}&mode=Delivery)` }} />
                <Grid item className="TextContainer">
                    <Typography className="TitleText" variant="body2">{progress.title}</Typography>
                    <Typography variant="body1">Downloading{progress.estimatedFinish && <>, <RelativeTimeComponent date={progress.estimatedFinish} complete={false} /></>}</Typography>
                    <div className="ProgressContainer">
                        <Typography variant="body1">{Math.round(progress.progress * 100)}%</Typography>
                        <LinearProgress variant="determinate" value={progress.progress * 100} color="secondary" />
                    </div>
                </Grid>
            </Grid>
            <hr />
        </>
    )
}