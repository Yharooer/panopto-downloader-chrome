import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AppBar, CircularProgress, Grid, Typography } from '@mui/material';
import './BackgroundPage.css';
import TitleComponent from '../components/TitleComponent/TitleComponent';
import { Box } from '@mui/system';
import { DownloadManagerStatus, getProgress, initialiseDownloadManager } from './DownloadManager/DownloadManager';
import { useAutoRefresh } from '../utils/useAutoRefresh';
import { DownloadListComponent } from '../components/DownloadListComponent/DownloadListComponent';

function BackgroundPage() {
    const [downloadManagerState, setDownloadManagerState] = useState<DownloadManagerStatus>("WAITING");
    
    const onLoad = useCallback(async () => {
        const result = await initialiseDownloadManager();
        setDownloadManagerState(result ? 'READY' : 'REJECTED');
    }, [setDownloadManagerState]);

    useEffect(() => {
        onLoad().then();
    }, []);

    const { data } = useAutoRefresh(() => getProgress(), [], 500);
    const activeDownloads = useMemo(() => data?.filter(d => !d.completed) || [], [data]);

    const topText = useMemo(() => {
        switch(downloadManagerState) {
            case 'WAITING': 
                return <CircularProgress color="secondary" />
            case 'READY':
                if (activeDownloads.length > 0) {
                    return <Typography variant="body1">Please keep this tab open until your downloads complete.</Typography>;
                }
                return <Typography variant="body1">There are no active downloads. You can safely close this window.</Typography>;
            case 'REJECTED':
                return <Typography variant="body1">This window is not being used. You can safely close it.</Typography>;
        }
    }, [downloadManagerState, activeDownloads]);

    return (
        <Box id='main' sx={{ backgroundColor: 'primary.main' }}>
            <AppBar className="TitlePaper" position="static" color="default">
                <div className="content">
                    <TitleComponent />
                </div>
            </AppBar>
            <div className="mainContainer">
                <Grid container justifyContent="center" style={{ paddingLeft: 8, paddingRight: 8 }}>
                    {topText}
                </Grid>
                <DownloadListComponent downloads={data} />
            </div>
        </Box>
    );
}

export default BackgroundPage;
