import type { Position, Settings } from './types';

const STORAGE_KEY = 'pagelink-copy-button.settings';

export const DEFAULT_SETTINGS: Settings = {
  visible: true,
  position: null,
};

function isPosition(value: unknown): value is Position {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.x === 'number' && typeof candidate.y === 'number';
}

function normalizeSettings(value: unknown): Settings {
  if (typeof value !== 'object' || value === null) {
    return { ...DEFAULT_SETTINGS };
  }

  const candidate = value as Record<string, unknown>;
  return {
    visible: candidate.visible !== false,
    position: isPosition(candidate.position) ? candidate.position : null,
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return normalizeSettings(stored[STORAGE_KEY]);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: settings });
}
