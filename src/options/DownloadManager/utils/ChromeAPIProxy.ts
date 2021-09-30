import { postMessage } from '../DownloadManager';
import { v4 as uuid } from 'uuid';
import { ChromeProxyRequest, ChromeProxyResponse } from '../DownloadManagerTypes';

type ChromeProxyTarget = () => { path: string[] }

const resolveMap = new Map();
const rejectMap = new Map();

export function handleResponse(message: ChromeProxyResponse) {
    console.log('got request ' + resolveMap.has(message.uuid) ? ' and can find resolve ' : ' and cannot find resolve');

    if (!('error' in message)) {
        const resolve = resolveMap.get(message.uuid);
        resolveMap.delete(message.uuid);
        rejectMap.delete(message.uuid);
        resolve(message.response);
    }
    else {
        const reject = rejectMap.get(message.uuid);
        resolveMap.delete(message.uuid);
        rejectMap.delete(message.uuid);
        reject(new Error(message.error));
    }
}

interface ChromeProxy extends Record<string, any> { };

const handler: ProxyHandler<ChromeProxyTarget> = {
    get: (target: ChromeProxyTarget, name: string): ChromeProxy => {
        return new Proxy(() => ({ path: [...target().path, name] }), handler);
    },

    apply: (target: ChromeProxyTarget, thisArg: ChromeProxy, argumentsList: any[]): Promise<any> => {
        return new Promise((resolve, reject) => {
            const requestId = uuid();
            resolveMap.set(requestId, resolve);
            rejectMap.set(requestId, reject);
            postMessage({ action: "CHROME_PROXY_REQUEST", path: target().path, args: argumentsList, uuid: requestId } as ChromeProxyRequest);

            setTimeout(() => {
                if (resolveMap.has(requestId)) {
                    reject(new Error('Chrome proxy request timed out.'));
                }
            }, 60000);
        });
    }
}

export const chromeProxy: ChromeProxy = new Proxy((() => ({ path: [] })) as ChromeProxyTarget, handler);