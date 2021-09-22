import React from 'react';
import './App.css';
import { Alert, Grid } from '@mui/material';
import TitleComponent from './components/TitleComponent/TitleComponent';
import MainSelectorComponent from './components/MainSelectorComponent/MainSelectorComponent';
import FooterComponent from './components/FooterComponent/FooterComponent';
import HorizontalRule from './components/HorizontalRule/HorizontalRule';
import { initialiseDownloadManagerHandler } from './DownloadManagerHandler';
import DownloadManagerPage from './components/DownloadManagerPage/DownloadManagerPage';

function App() {
    try {
        initialiseDownloadManagerHandler();
    }
    catch (error) {
        console.error(error);
    }

    return (
        <Grid id='main' container>
            <TitleComponent />
            <Alert severity="warning" style={{ textAlign: "left" }}>This version of Panopto Downloader is currently in development. Some features may not work as expected.</Alert>
            <MainSelectorComponent />
            <HorizontalRule />
            <FooterComponent />
            <DownloadManagerPage />
        </Grid>
    );
}

export default App;
