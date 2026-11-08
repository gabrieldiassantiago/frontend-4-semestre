"use server"

import { apiFetch } from "@/lib/server/api"
import type { UserPreferences } from "@/lib/types/preferences"

export async function getPreferencesAction() {
  return apiFetch<UserPreferences>("/users/me/preferences")
}

export async function savePreferencesAction(preferences: UserPreferences) {
  return apiFetch<UserPreferences>("/users/me/preferences", {
    method: "PUT",
    body: preferences,
  })
}
