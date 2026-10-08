export interface UserPreferences {
  defaultLandingView: string;
  compactCards: boolean;
  highlightOverdue: boolean;
  confirmDelete: boolean;
  showAssignedBanner: boolean;
  showLiveWorkers: boolean;
  soundEffects: boolean;
  themeAccent: "yellow" | "green" | "blue" | "pink" | "mono";
  shadowStyle: "crisp" | "bold" | "heavy";
  customRoleTitle: Record<string, string>;
  bioStatus: Record<string, string>;
}

const STORAGE_KEY = "bloc_user_preferences_v1";

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultLandingView: "/",
  compactCards: false,
  highlightOverdue: true,
  confirmDelete: true,
  showAssignedBanner: true,
  showLiveWorkers: true,
  soundEffects: true,
  themeAccent: "yellow",
  shadowStyle: "bold",
  customRoleTitle: {},
  bioStatus: {},
};

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      customRoleTitle: {
        ...DEFAULT_PREFERENCES.customRoleTitle,
        ...(parsed.customRoleTitle || {}),
      },
      bioStatus: {
        ...DEFAULT_PREFERENCES.bioStatus,
        ...(parsed.bioStatus || {}),
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new Event("bloc_preferences_updated"));
  } catch (e) {
    console.warn("Failed to save user preferences:", e);
  }
}
