export const filenameFromVideoName = (name: string, suffix?: string) => {
    let filename = name.replace(/[/\\:*?<>]/g, ' ');
    filename = filename.replace('"', "'");
    while (filename.includes('..')) {
        filename = filename.replace('..', '');
    }
    if (suffix) {
        return filename + suffix + '.mp4';
    }
    return filename + '.mp4';
}