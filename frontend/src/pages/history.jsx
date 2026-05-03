import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Loader2,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { listJobs, JOB_STATUSES } from "@/api/jobs";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = React.useState(null);
  const [data, setData] = React.useState({ jobs: [], total: 0 });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [offset, setOffset] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await listJobs({
        status: statusFilter || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      setData(next);
    } catch (err) {
      setError(err.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onFilterChange = (next) => {
    setOffset(0);
    setStatusFilter(next);
  };

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <main className="relative mx-auto max-w-6xl px-6 pb-24 pt-32">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
            jobs
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            History
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/55">
            Every brief Vera has run through the pipeline. Click a row to open
            the live status page.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          Refresh
        </Button>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        <FilterChip
          active={statusFilter === null}
          onClick={() => onFilterChange(null)}
        >
          All
        </FilterChip>
        {JOB_STATUSES.map((s) => (
          <FilterChip
            key={s}
            active={statusFilter === s}
            onClick={() => onFilterChange(s)}
          >
            {s.replaceAll("_", " ").toLowerCase()}
          </FilterChip>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
            <tr>
              <th className="px-5 py-3 font-normal">Brief</th>
              <th className="px-5 py-3 font-normal">Platform</th>
              <th className="px-5 py-3 font-normal">Duration</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Created</th>
              <th className="px-5 py-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {loading && data.jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-white/55">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td>
              </tr>
            )}

            {error && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-red-200"
                >
                  <AlertTriangle className="mr-2 inline h-4 w-4" />
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && data.jobs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-white/55"
                >
                  No jobs yet. Submit a brief from the{" "}
                  <Link to="/" className="text-primary hover:underline">
                    dashboard
                  </Link>
                  .
                </td>
              </tr>
            )}

            {data.jobs.map((job, index) => (
              <motion.tr
                key={job.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                className="border-t border-white/5 transition-colors hover:bg-white/[0.03]"
              >
                <td className="max-w-[360px] px-5 py-4 align-top">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="block truncate text-white hover:text-primary"
                  >
                    {job.prompt || (
                      <span className="text-white/45">(image-only brief)</span>
                    )}
                  </Link>
                  <p className="mt-0.5 truncate font-mono text-[0.65rem] text-white/35">
                    {job.id}
                  </p>
                </td>
                <td className="px-5 py-4 align-top text-sm capitalize text-white/75">
                  {job.platform}
                </td>
                <td className="px-5 py-4 align-top text-sm text-white/75">
                  {job.duration_seconds}s
                  {job.use_3d && (
                    <span className="ml-2 rounded-full border border-white/10 px-1.5 py-px text-[0.55rem] uppercase tracking-[0.2em] text-white/55">
                      3d
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 align-top">
                  <StatusBadge status={job.status} />
                </td>
                <td className="px-5 py-4 align-top text-sm text-white/55">
                  {formatDate(job.created_at)}
                </td>
                <td className="px-5 py-4 align-top text-right">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white"
                  >
                    Open
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.total > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-between text-xs text-white/55">
          <p>
            Page {currentPage} of {totalPages} · {data.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= data.total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors",
        active
          ? "border-primary/50 bg-primary/15 text-white"
          : "border-white/10 bg-white/[0.03] text-white/65 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
