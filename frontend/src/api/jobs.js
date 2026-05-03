import { api } from "./client";

export const JOB_STATUSES = [
  "PENDING",
  "GENERATING_IMAGE",
  "GENERATING_3D",
  "GENERATING_VIDEO",
  "VIDEO_READY",
  "POSTED",
  "FAILED",
];

export const TERMINAL_STATUSES = new Set(["VIDEO_READY", "POSTED", "FAILED"]);

/**
 * POST /api/jobs — multipart/form-data.
 * The backend accepts everything as Form() fields, including the optional
 * input_image upload, so we always ship a FormData even when no file exists.
 */
export async function createJob({
  prompt,
  avatarId = "vera",
  duration = 10,
  use3d = false,
  platform = "instagram",
  inputImage,
}) {
  const form = new FormData();
  if (prompt) form.append("prompt", prompt);
  form.append("avatar_id", avatarId);
  form.append("duration", String(duration));
  form.append("use_3d", String(use3d));
  form.append("platform", platform);
  if (inputImage) form.append("input_image", inputImage);

  const { data } = await api.post("/api/jobs", form);
  return data;
}

export async function getJob(jobId) {
  const { data } = await api.get(`/api/jobs/${jobId}`);
  return data;
}

export async function listJobs({ status, limit = 20, offset = 0 } = {}) {
  const { data } = await api.get("/api/jobs", {
    params: { status, limit, offset },
  });
  return data;
}

export async function publishJob(jobId, { platform, scheduledAt } = {}) {
  const { data } = await api.post(`/api/jobs/${jobId}/post`, {
    platform: platform || null,
    scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
  });
  return data;
}
