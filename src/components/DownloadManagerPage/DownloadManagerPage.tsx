import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { AppBar, Grid, IconButton, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import clsx from 'clsx';
import React, { useCallback, useMemo, useState } from 'react';
import { getDownloads } from '../../DownloadManagerHandler';
import { useAutoRefresh } from '../../utils/useAutoRefresh';
import { DownloadItem } from '../DownloadItem/DownloadItem';
import './DownloadManagerPage.css';

const DownloadManagerPage = () => {

    // Later move useState to context
    const [isOpen, setIsOpen] = useState(false);

    const onClick = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const { data } = useAutoRefresh(async (_signal) => {
        return await getDownloads();
    }, [], 500);

    const activeDownloads = useMemo(() => data?.filter(d => !d.completed) || [], [data]);
    const completedDownloads = useMemo(() => data?.filter(d => d.completed) || [], [data]);

    const titleText = useMemo(() => {
        if (activeDownloads.length > 0) {
            return `${activeDownloads.length} Video${activeDownloads.length > 1 ? 's' : ''} Downloading`;
        }
        if (completedDownloads.length > 0) {
            return `${completedDownloads.length} Download${completedDownloads.length > 1 ? 's' : ''} Completed`;
        }
        return 'No Videos Downloading';
    }, [activeDownloads, completedDownloads]);

    const isHidden = useMemo(() => {
        return !data || data.length === 0;
    }, [data]);

    if (!data) {
        return <></>
    }

    return (
        <>
            <div className={clsx(["MainPagePadding", isHidden ? "hidden" : undefined])} />
            <div className="OuterPositioning">
                <Box className={clsx(["DownloadManagerPage", isOpen && !isHidden ? "open" : undefined, isHidden ? "hidden" : undefined])} sx={{ backgroundColor: 'primary.main', borderRadius: 0 }}>
                    <AppBar elevation={0} position="static">
                        <Toolbar variant='dense'>
                            <IconButton
                                edge="start"
                                color="inherit"
                                onClick={onClick}
                                aria-label="close"
                                size="large">
                                <ExpandLessIcon className="ExpandIcon" />
                            </IconButton>
                            <Typography className="ToolbarTitle" variant="h6">
                                {titleText}
                            </Typography>
                        </Toolbar>
                    </AppBar>

                    <Grid container>
                        {activeDownloads.length > 0 &&
                            <>
                                <div className="TitleContainer">
                                    <Typography variant="button">Active Downloads</Typography>
                                </div>
                                <hr />
                            </>
                        }

                        {activeDownloads.map(p => <DownloadItem progress={p} />)}

                        {completedDownloads.length > 0 &&
                            <>
                                <div className="TitleContainer">
                                    <Typography variant="button">Completed Downloads</Typography>
                                </div>
                                <hr />
                            </>
                        }
                        {completedDownloads.map(p => <DownloadItem progress={p} />)}
                    </Grid>
                </Box>
            </div>
        </>
    );
};

export default DownloadManagerPage;
