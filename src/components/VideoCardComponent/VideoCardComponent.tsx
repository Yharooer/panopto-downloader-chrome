import { Alert, Button, CircularProgress, Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { PanoptoDeliveryInfo } from '../../common/PanoptoDeliveryInfo';
import DownloadInitialiserDialog from '../DownloadInitialiserDialog/DownloadInitialiserDialog';
import './VideoCardComponent.css';

const VideoCardComponent = ({ videoId, hostname }: { videoId: string, hostname: string }) => {

    const [dialogOpen, setDialogOpen] = useState(false);

    const { value, error, loading } = useAsync(async () => {
        const formData: string[][] = [];
        formData.push(['deliveryId', videoId]);
        formData.push(['isLiveNotes', 'false']);
        formData.push(['isActiveBroadcast', 'false']);
        formData.push(['refreshAuthCookie', 'true']);
        formData.push(['isEditing', 'false']);
        formData.push(['isKollectiveAgentInstalled', 'false']);
        formData.push(['isEmbed', 'false']);
        formData.push(['responseType', 'json']);

        const params : RequestInit = {
            method: 'POST',
            credentials: 'same-origin',
            body: new URLSearchParams(formData)
        };

        const response = await fetch(`https://${hostname}/Panopto/Pages/Viewer/DeliveryInfo.aspx`, params);

        if (response.status !== 200) {
            throw new Error(`${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        if (json.ErrorCode && json.ErrorMessage) {
            throw new Error(json.ErrorMessage);
        }

        return json as PanoptoDeliveryInfo;
        
    }, [videoId, hostname]);

    if (loading) {
        return (
            <Grid container className="VideoElement">
            <div className="ImageContainer" style={{ backgroundImage: `url(https://${hostname}/Panopto/Services/FrameGrabber.svc/FrameRedirect?objectId=${videoId}&mode=Delivery)` }} />
            <Grid item className="TextContainer">
                <div className="loadingHolder">
                    <CircularProgress size="24px" />
                </div>
            </Grid>
        </Grid>
        )
    }

    if (error || !value) {
        return <Alert style={{ width: '100%' }} severity="error">{error?.message}</Alert>
    }

    return (
        <Grid container className="VideoElement">
            <div className="ImageContainer" style={{ backgroundImage: `url(https://${hostname}/Panopto/Services/FrameGrabber.svc/FrameRedirect?objectId=${videoId}&mode=Delivery)` }} />
            <Grid item className="TextContainer">
                <Typography variant="body2">{value?.Delivery?.SessionName}</Typography>
                <Button onClick={() => setDialogOpen(true)} color="primary">Download</Button>
            </Grid>
            <DownloadInitialiserDialog key={'did_'+videoId} open={dialogOpen} handleClose={()=>setDialogOpen(false)} responseData={value} hostname={hostname} />
        </Grid>
    )
};

export default VideoCardComponent;
