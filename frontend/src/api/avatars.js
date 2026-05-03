import { api } from "./client";

export async function getAvatarConfig(avatarId = "vera") {
  const { data } = await api.get(`/api/avatars/${avatarId}/config`);
  return data;
}

export async function updateAvatarConfig(avatarId, patch) {
  const { data } = await api.put(`/api/avatars/${avatarId}/config`, patch);
  return data;
}
