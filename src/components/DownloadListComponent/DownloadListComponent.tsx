import { Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { DownloadProgress } from '../../options/DownloadManager/DownloadManagerTypes';
import { DownloadItem } from '../DownloadItem/DownloadItem';
import './DownloadListComponent.css';

export const DownloadListComponent = ({downloads}: {downloads: DownloadProgress[] | undefined}) => {

    const activeDownloads = useMemo(() => downloads?.filter(d => !d.completed) || [], [downloads]);
    const completedDownloads = useMemo(() => downloads?.filter(d => d.completed) || [], [downloads]);

    if (!downloads) {
        return <></>
    }

    return (
        <Grid container>
            {activeDownloads.length > 0 &&
                <>
                    <div className="TitleContainer">
                        <Typography variant="subtitle1">Active Downloads</Typography>
                    </div>
                    <hr />
                </>
            }

            {activeDownloads.map((p,i) => <DownloadItem progress={p} key={i} />)}

            {completedDownloads.length > 0 &&
                <>
                    <div className="TitleContainer">
                        <Typography variant="subtitle1">Completed Downloads</Typography>
                    </div>
                    <hr />
                </>
            }
            {completedDownloads.map((p,i) => <DownloadItem progress={p} key={i} />)}
        </Grid>
    )
}