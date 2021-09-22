import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { createTheme , responsiveFontSizes, ThemeProvider } from '@mui/material';

const theme = responsiveFontSizes(createTheme({
    palette: {
        primary: {
            main: '#2e7d32'
        },
        secondary: {
            main: '#ffc107'
        }
    },
    typography: {
        fontSize: 11,
        body1: {
            lineHeight: "normal",
            letterSpacing: 0
        },
        body2: {
            fontSize: 14,
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: 0
        },
        button: {
            letterSpacing: '0.04em',
            fontSize: 14,
            fontWeight: 500
        }
    }
}), {});

ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);