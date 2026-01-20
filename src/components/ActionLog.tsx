import { useRef, useEffect } from 'react';
import type { LogEntry } from '../types/game';
import './ActionLog.css';

interface ActionLogProps {
  logs: LogEntry[];
}

export function ActionLog({ logs }: ActionLogProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="log" aria-label="Action Log">
      <div className="log-header">
        <div className="label">Action Log</div>
      </div>
      <div
        className="log-feed"
        ref={feedRef}
        aria-live="polite"
        aria-atomic="false"
      >
        {logs.map((log) => (
          <div key={log.id} className={`log-item ${log.kind}`}>
            {log.message}
          </div>
        ))}
      </div>
    </section>
  );
}
