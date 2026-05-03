import * as React from "react";

import { getJob, TERMINAL_STATUSES } from "@/api/jobs";

/**
 * Polls GET /api/jobs/{id} on an interval until the job reaches a terminal
 * state (VIDEO_READY / POSTED / FAILED). We chose polling over websockets
 * deliberately — the PRD ships polling for the MVP and the WS upgrade is
 * scoped to Phase 2.
 */
export function useJobPoll(jobId, { intervalMs = 3000 } = {}) {
  const [job, setJob] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(Boolean(jobId));

  const cancelledRef = React.useRef(false);

  const refresh = React.useCallback(async () => {
    if (!jobId) return null;
    try {
      const next = await getJob(jobId);
      if (cancelledRef.current) return next;
      setJob(next);
      setError(null);
      return next;
    } catch (err) {
      if (cancelledRef.current) return null;
      setError(err.detail || err.message);
      return null;
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    cancelledRef.current = false;
    if (!jobId) return;

    let timer;
    const tick = async () => {
      const next = await refresh();
      if (cancelledRef.current) return;
      if (!next || !TERMINAL_STATUSES.has(next.status)) {
        timer = setTimeout(tick, intervalMs);
      }
    };
    tick();

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [jobId, intervalMs, refresh]);

  return { job, loading, error, refresh, setJob };
}
