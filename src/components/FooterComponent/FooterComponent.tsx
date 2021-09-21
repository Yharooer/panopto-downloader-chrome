import { Typography } from '@mui/material';
import React from 'react';
import './FooterComponent.css';

const FooterComponent = () => (
    <div className="FooterComponent">
        <Typography className='footer'>Panopto Downloader by Bentley Carr</Typography>
        <Typography className='footer clickable' onClick={_ => chrome.tabs.create({ url: 'https://github.com/Yharooer/panopto-downloader-chrome' })}>github.com/Yharooer/panopto-downloader-chrome</Typography>
    </div>
);

export default FooterComponent;
