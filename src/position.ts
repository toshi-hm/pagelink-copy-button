import type { Position } from './types';

export const BUTTON_SIZE = 56;
export const VIEWPORT_INSET = 24;

export function clampPosition(
  position: Position,
  viewport: { width: number; height: number },
  buttonSize = BUTTON_SIZE,
): Position {
  const maxX = Math.max(0, viewport.width - buttonSize);
  const maxY = Math.max(0, viewport.height - buttonSize);

  return {
    x: Math.min(Math.max(0, position.x), maxX),
    y: Math.min(Math.max(0, position.y), maxY),
  };
}

export function getDefaultPosition(viewport: { width: number; height: number }): Position {
  return clampPosition(
    {
      x: viewport.width - BUTTON_SIZE - VIEWPORT_INSET,
      y: viewport.height - BUTTON_SIZE - VIEWPORT_INSET,
    },
    viewport,
  );
}
