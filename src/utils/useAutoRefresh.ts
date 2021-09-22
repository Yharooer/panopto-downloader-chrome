import { useEffect, useState, useRef } from 'react';
import { useUpdate } from 'react-use';
export type AsyncResult<T> = { data: T | undefined, error: Error | undefined, loading: boolean };
export function useAutoRefresh<T>(fetch_fn: (cancel: AbortSignal) => Promise<T>, dependency: any[], refreshMs: number): AsyncResult<T> {
    let [error, setError] = useState<Error | undefined>(undefined);
    let [data, setData] = useState<T | undefined>(undefined);
    let force_update = useUpdate();
    let current_abort_ref = useRef<AbortController | undefined>(undefined);

    function update() {
        if (current_abort_ref.current) {
            current_abort_ref.current.abort();
            current_abort_ref.current = undefined;
        }
        current_abort_ref.current = new AbortController();
        let this_request_abort = current_abort_ref.current;
        fetch_fn(current_abort_ref.current.signal).then(res => {
            if (this_request_abort !== current_abort_ref.current) {
                return;
            }
            current_abort_ref.current = undefined;
            setError(undefined);
            setData(res);
        }, err => {
            if (this_request_abort !== current_abort_ref.current) {
                return;
            }
            current_abort_ref.current = undefined;
            setError(err);
        });
        force_update();
    }
    useEffect(() => setData(undefined), dependency);
    useEffect(() => {
        update();
        let interval = setInterval(() => {
            if (current_abort_ref.current !== undefined) {
                return;
            }
            update();
        }, refreshMs);
        return () => {
            clearInterval(interval);
            if (current_abort_ref.current) {
                current_abort_ref.current.abort();
                current_abort_ref.current = undefined;
            }
        }
    }, [...dependency, refreshMs]);
    return { data, error, loading: current_abort_ref.current !== undefined || (data === undefined && error === undefined) };
}