import { useEffect, useState, useRef } from 'react';
import { useUpdate } from 'react-use';
export type AsyncResult<T> = { data: T | null, error: Error | null, loading: boolean };
export function useAutoRefresh<T>(fetch_fn: (cancel: AbortSignal) => Promise<T>, dependency: any[], refreshMs: number): AsyncResult<T> {
    let [error, setError] = useState<Error | null>(null);
    let [data, setData] = useState<T | null>(null);
    let force_update = useUpdate();
    let current_abort_ref = useRef<AbortController | null>(null);

    function update() {
        if (current_abort_ref.current) {
            current_abort_ref.current.abort();
            current_abort_ref.current = null;
        }
        current_abort_ref.current = new AbortController();
        let this_request_abort = current_abort_ref.current;
        fetch_fn(current_abort_ref.current.signal).then(res => {
            if (this_request_abort !== current_abort_ref.current) {
                return;
            }
            current_abort_ref.current = null;
            setError(null);
            setData(res);
        }, err => {
            if (this_request_abort !== current_abort_ref.current) {
                return;
            }
            current_abort_ref.current = null;
            setError(err);
        });
        force_update();
    }
    useEffect(() => setData(null), dependency);
    useEffect(() => {
        update();
        let interval = setInterval(() => {
            if (current_abort_ref.current !== null) {
                return;
            }
            update();
        }, refreshMs);
        return () => {
            clearInterval(interval);
            if (current_abort_ref.current) {
                current_abort_ref.current.abort();
                current_abort_ref.current = null;
            }
        }
    }, [...dependency, refreshMs]);
    return { data, error, loading: current_abort_ref.current !== null || (data === null && error === null) };
}