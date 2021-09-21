import { v4 as uuid } from 'uuid';
import { DownloadProgress } from '../DownloadManagerTypes';

export abstract class DownloadItem {

    public uuid: string;

    constructor() {
        this.uuid = uuid();
    }

    abstract initialise(): void;
    abstract getProgress(): Promise<DownloadProgress>;
    abstract terminate(): void;
}