import { describe, expect, test } from 'bun:test';

import { clampPosition, getDefaultPosition } from '../src/position';

describe('position helpers', () => {
  test('defaults to the lower-right corner with an inset', () => {
    expect(getDefaultPosition({ width: 1280, height: 800 })).toEqual({ x: 1200, y: 720 });
  });

  test('keeps a dragged button inside the viewport', () => {
    expect(clampPosition({ x: -20, y: 900 }, { width: 320, height: 240 })).toEqual({
      x: 0,
      y: 184,
    });
  });
});
