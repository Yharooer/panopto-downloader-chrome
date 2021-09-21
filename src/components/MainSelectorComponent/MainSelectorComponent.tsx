import { Alert, Box, CircularProgress, Grid, Typography } from '@mui/material';
import React from 'react';
import './MainSelectorComponent.css';
import { v4 as uuidv4 } from 'uuid';
import { scraper } from './scraper';
import { useAsync } from 'react-use';
import VideoCardComponent from '../VideoCardComponent/VideoCardComponent';
import HorizontalRule from '../HorizontalRule/HorizontalRule';

// Wrapper function which executes scraper() in the current tab asynchronously and
// returns the result to the popup window.
function loadPanoptoVideos(): Promise<{ hostname: string, videoIds: string[] }> {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }).then(currentTabs => {
            // UUID so that multiple loadPanoptoVideos promises don't clash.
            const uuid = uuidv4();

            const currentTab = currentTabs[0];

            // Scraping needs to be done in the current tab, not in the popup. Handle
            // the reponse from the current tab.
            chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
                if (request.uuid === uuid) {
                    if (request.error) {
                        reject(new Error('Error while scraping videos: ' + request.data));
                    }
                    resolve({
                        hostname: (new URL(currentTab.url as string)).hostname,
                        videoIds: request.data
                    });
                }
            });

            // Execute the scraper function in the current tab and wrap the response into
            // a message to be sent from the current tab back to the popup window.
            // TODO change this horrible type cast.
            chrome.scripting.executeScript({
                target: { tabId: (currentTab.id as number) },
                args: [uuid],
                func: (scraper as () => void)
            });
        });
    });
}

const MainSelectorComponent = () => {

    const { value, error, loading } = useAsync(loadPanoptoVideos, []);

    if (loading) {
        return (
            <div className="loadingHolder">
                <CircularProgress size="24px" />
            </div>
        )
    }

    if (error || !value) {
        console.error(error);
        return <Alert style={{ width: '100%' }} severity="error">{error?.message}</Alert>
    }

    if (value.videoIds.length === 0) {
        return (
        <Box className="container" textAlign="center">
            <Typography variant="body1">
                No Panopto videos detected on this page.
            </Typography>
        </Box>
        );
    }

    return (
        <Grid container>
            <Box className="container disclaimer" textAlign="center">
                <Typography variant="body1">
                    Panopto Downloader is in no way affiliated with Panopto. You should check with your institution to determine whether you are permitted to store downloads of recordings before using this tool.
                </Typography>
            </Box>
            {value.videoIds.map(id => <VideoCardComponent videoId={id} hostname={value.hostname} key={'vcc_'+id} />).reduce<JSX.Element[]>((accum: JSX.Element[], curr: JSX.Element, index, _array): JSX.Element[] => { accum.push(<HorizontalRule key={'hr_'+value.videoIds[index]} />); accum.push(curr); return accum; }, [])}
        </Grid>
    )
};

export default MainSelectorComponent;
