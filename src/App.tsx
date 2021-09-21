import React from 'react';
import './App.css';
import { Grid } from '@mui/material';
import TitleComponent from './components/TitleComponent/TitleComponent';
import MainSelectorComponent from './components/MainSelectorComponent/MainSelectorComponent';
import FooterComponent from './components/FooterComponent/FooterComponent';
import HorizontalRule from './components/HorizontalRule/HorizontalRule';
import { initialiseDownloadManager } from './DownloadManagerHandler';
import DownloadManagerPage from './components/DownloadManagerPage/DownloadManagerPage';

function App() {
    try {
        initialiseDownloadManager();
    }
    catch (error) {
        console.error(error);
    }

    return (
        <Grid id='main' container>
            <TitleComponent />
            <MainSelectorComponent />
            <HorizontalRule />
            <FooterComponent />
            <DownloadManagerPage />
        </Grid>
    );
}

export default App;
