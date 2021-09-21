import { Alert, Paper } from '@mui/material';
import React from 'react';
import './TitleComponent.css';

const TitleComponent = () => (
    <div className="TitleComponent">
        <img id='title_image' alt='Panopto Downloader Logo' src='/img/header.svg' />
        <Paper elevation={1}>
            <Alert severity="warning" style={{ textAlign: "left" }}>This version of Panopto Downloader is currently in development. Some features may not work as expected.</Alert>
        </Paper>
        <br />
    </div>
);

export default TitleComponent;
