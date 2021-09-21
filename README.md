# Panopto Downloader
![Panopto Downloader Logo](img/header.svg)

## Thank you for your support
On 30 July 2021, Panopto changed the way its "Podcast mode" works. As a result, the original version of Panopto Downloader stopped working for most organisations.

In response, Panopto Downloader version 2 is on the way. Panopto Downloader v2 works by directly converting video streams to video files using [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) rather than relying on Panopto's "Podcast mode". Panopto Downloader v2 is still under development and as a result, some features may not work as expected. Panopto Downloader v2 is not yet available on the Chrome Web Store and will be published once its development is more complete.

There is no estimated completion date for Panopto Downloader version 2.

## About
Panopto Downloader is a extension for Google Chrome to download videos from the lecture streaming service Panopto. Both individual videos and folders of videos can be downloaded. Panopto Downloader supports videos with multiple streams. 

## Disclaimer
Panopto Downloader is in no way affiliated with Panopto. You should check with your institution to determine whether you are permitted to store downloads of recordings before using this tool.

<!-- ## Get
Panopto Downloader is [available on the Chrome Web Store](https://chrome.google.com/webstore/detail/panopto-downloader/jcgoagdconfndcjginjeokegdpahebno). -->

## Development
Panopto Downloader requires `npm` to run locally.

After cloning, to set up we require running `npm install`.

To develop locally run `npm run start` and point Google Chrome to load the extension from the `/dev` directory.

To publish, run `npm run build` and package the `/build` directory.

### Issues
Note that at the moment there is an issue where if [`/src/components/MainSelectorComponent/scrapter.ts`](https://github.com/Yharooer/panopto-downloader-chrome/blob/master/src/components/MainSelectorComponent/scrapter.ts) uses certain syntax requiring polyfills, then Babel will reference an external function and break Chrome's script injection. Be cautious because sometimes this occurs in production whilst not happening in development. Check that loading the list of videos on the page works in production before pushing. You should not have to worry if you don't change `scraper.ts`.