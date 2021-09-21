import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DateTime, Interval } from 'luxon';

const REFRESH_INTERVAL = 250;

export const RelativeTimeComponent = ({date, complete}: {date: Date, complete?: boolean}) => {
    const [text, setText] = useState<string>("");
    const luxonTime = useMemo(() => DateTime.fromJSDate(date), [date]);

    const refreshText = useCallback(() => {

        if (DateTime.now() > luxonTime && complete !== false) {
            const duration = Interval.fromDateTimes(luxonTime, DateTime.now()).toDuration();
            if (duration.toMillis() > 0 && duration.toMillis() < 60000) {
                setText('just now');
                return;
            }
            setText(luxonTime.toRelative() || "");
            return;
        }

        let text = luxonTime.toRelative({style: 'short'}) || "";

        if (!text.startsWith('in ')) {
            setText('almost done');
            return;
        }

        text = text.slice(3) + ' left';
        setText(text);
    }, [luxonTime, complete]);
    
    useEffect(() => {
        if (REFRESH_INTERVAL > 0) {
            const interval = setInterval(refreshText, REFRESH_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [refreshText]);

    return <>{text}</>;
}