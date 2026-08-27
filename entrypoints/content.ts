import { defineContentScript } from 'wxt/utils/define-content-script';

import { copyLink, createLinkPayload } from '../src/copy-link';
import { clampPosition, getDefaultPosition } from '../src/position';
import { loadSettings, saveSettings } from '../src/storage';
import type { Position, Settings } from '../src/types';

const UI_ID = 'pagelink-copy-button-ui';
const SUCCESS_DURATION = 1500;
const DRAG_THRESHOLD = 4;

type ContentMessage = { type: 'set-visible'; visible: boolean } | { type: 'reset-position' };

function isContentMessage(value: unknown): value is ContentMessage {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.type === 'set-visible' && typeof candidate.visible === 'boolean') ||
    candidate.type === 'reset-position'
  );
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    let settings: Settings = { visible: true, position: null };
    let host: HTMLDivElement | undefined;
    let button: HTMLButtonElement | undefined;
    let menu: HTMLDivElement | undefined;
    let currentPosition: Position | undefined;
    let suppressNextClick = false;
    let statusTimer: number | undefined;

    const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });

    const persistSettings = () => {
      void saveSettings(settings).catch((error: unknown) => {
        console.error('[PageLink Copy Button] Failed to save settings', error);
      });
    };

    const hideMenu = () => {
      if (menu) {
        menu.hidden = true;
      }
    };

    const applyPosition = (position: Position) => {
      if (!host) {
        return;
      }

      currentPosition = clampPosition(position, viewport());
      host.style.left = `${currentPosition.x}px`;
      host.style.top = `${currentPosition.y}px`;
    };

    const applyStatus = (state: 'idle' | 'copying' | 'success' | 'error') => {
      if (!button) {
        return;
      }

      button.dataset.state = state;
      button.disabled = state === 'copying';
      button.innerHTML =
        state === 'success'
          ? '<span class="icon" aria-hidden="true">✓</span><span class="sr-only">コピーしました</span>'
          : '<span class="icon" aria-hidden="true">↗</span><span class="sr-only">ページリンクをコピー</span>';
      button.setAttribute(
        'aria-label',
        state === 'success' ? 'ページリンクをコピーしました' : 'ページリンクをコピー',
      );
    };

    const showTemporaryStatus = (state: 'success' | 'error') => {
      if (statusTimer !== undefined) {
        window.clearTimeout(statusTimer);
      }

      applyStatus(state);
      statusTimer = window.setTimeout(() => applyStatus('idle'), SUCCESS_DURATION);
    };

    const copyCurrentPage = async () => {
      applyStatus('copying');

      try {
        await copyLink(createLinkPayload(document.title, window.location.href));
        showTemporaryStatus('success');
      } catch (error: unknown) {
        console.error('[PageLink Copy Button] Failed to copy link', error);
        showTemporaryStatus('error');
      }
    };

    const removeUi = () => {
      hideMenu();
      host?.remove();
      host = undefined;
      button = undefined;
      menu = undefined;
    };

    const mountUi = () => {
      if (host || !settings.visible || !document.documentElement) {
        return;
      }

      host = document.createElement('div');
      host.id = UI_ID;
      host.setAttribute('data-page-link-copy-button', 'true');
      host.style.cssText = 'position:fixed;z-index:2147483647;width:56px;height:56px;';

      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>
        :host { all: initial; }
        .wrapper { position: relative; width: 56px; height: 56px; font-family: system-ui, sans-serif; }
        .copy-button { align-items: center; background: #24c6dc; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 4px 14px rgb(15 23 42 / 24%); color: #fff; cursor: grab; display: flex; height: 56px; justify-content: center; padding: 0; touch-action: none; transition: background-color 120ms ease, transform 120ms ease; width: 56px; }
        .copy-button:hover { transform: scale(1.06); }
        .copy-button:active { cursor: grabbing; transform: scale(.96); }
        .copy-button:focus-visible, .menu-item:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 3px; }
        .copy-button[data-state="copying"] { cursor: wait; opacity: .75; }
        .copy-button[data-state="success"] { background: #22c55e; }
        .copy-button[data-state="error"] { background: #dc2626; }
        .icon { font-size: 28px; font-weight: 700; line-height: 1; }
        .sr-only { clip: rect(0 0 0 0); clip-path: inset(50%); height: 1px; overflow: hidden; position: absolute; white-space: nowrap; width: 1px; }
        .menu { background: #fff; border: 1px solid #cbd5e1; border-radius: 10px; bottom: 66px; box-shadow: 0 8px 24px rgb(15 23 42 / 20%); display: grid; gap: 4px; min-width: 180px; padding: 6px; position: absolute; right: 0; }
        .menu[hidden] { display: none; }
        .menu-item { background: transparent; border: 0; border-radius: 6px; color: #0f172a; cursor: pointer; font: 14px/1.4 system-ui, sans-serif; padding: 9px 10px; text-align: left; }
        .menu-item:hover { background: #e0f2fe; }
        @media (prefers-reduced-motion: reduce) { .copy-button { transition: none; } }
      </style>
      <div class="wrapper">
        <button class="copy-button" type="button" aria-label="ページリンクをコピー" title="ページリンクをコピー">
          <span class="icon" aria-hidden="true">↗</span><span class="sr-only">ページリンクをコピー</span>
        </button>
        <div class="menu" role="menu" hidden>
          <button class="menu-item hide-item" type="button" role="menuitem">このボタンを非表示</button>
          <button class="menu-item cancel-item" type="button" role="menuitem">キャンセル</button>
        </div>
      </div>`;

      button = shadow.querySelector<HTMLButtonElement>('.copy-button') ?? undefined;
      menu = shadow.querySelector<HTMLDivElement>('.menu') ?? undefined;
      const hideItem = shadow.querySelector<HTMLButtonElement>('.hide-item');
      const cancelItem = shadow.querySelector<HTMLButtonElement>('.cancel-item');

      if (!button || !menu || !hideItem || !cancelItem) {
        removeUi();
        return;
      }

      const uiMenu = menu;

      let drag: {
        origin: Position;
        pointerId: number;
        startX: number;
        startY: number;
        moved: boolean;
      } | null = null;

      button.addEventListener('click', () => {
        if (suppressNextClick) {
          suppressNextClick = false;
          return;
        }

        void copyCurrentPage();
      });

      button.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        uiMenu.hidden = false;
      });

      button.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || !currentPosition) {
          return;
        }

        drag = {
          origin: currentPosition,
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          moved: false,
        };
        button?.setPointerCapture(event.pointerId);
      });

      button.addEventListener('pointermove', (event) => {
        if (!drag || drag.pointerId !== event.pointerId) {
          return;
        }

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) {
          return;
        }

        drag.moved = true;
        applyPosition({ x: drag.origin.x + dx, y: drag.origin.y + dy });
      });

      const finishDrag = (event: PointerEvent) => {
        if (!drag || drag.pointerId !== event.pointerId) {
          return;
        }

        if (button?.hasPointerCapture(event.pointerId)) {
          button.releasePointerCapture(event.pointerId);
        }

        if (drag.moved && currentPosition) {
          suppressNextClick = true;
          settings.position = currentPosition;
          persistSettings();
        }
        drag = null;
      };

      button.addEventListener('pointerup', finishDrag);
      button.addEventListener('pointercancel', finishDrag);
      hideItem.addEventListener('click', () => {
        settings.visible = false;
        persistSettings();
        removeUi();
      });
      cancelItem.addEventListener('click', hideMenu);

      document.addEventListener('pointerdown', (event) => {
        if (event.composedPath().includes(host as HTMLDivElement)) {
          return;
        }
        hideMenu();
      });

      window.addEventListener('resize', () => {
        if (currentPosition) {
          applyPosition(currentPosition);
        }
      });

      document.documentElement.append(host);
      applyPosition(settings.position ?? getDefaultPosition(viewport()));
      applyStatus('idle');
    };

    const handleMessage = (message: unknown) => {
      if (!isContentMessage(message)) {
        return;
      }

      if (message.type === 'set-visible') {
        settings.visible = message.visible;
        persistSettings();
        if (message.visible) {
          mountUi();
        } else {
          removeUi();
        }
        return;
      }

      settings.position = null;
      persistSettings();
      if (currentPosition) {
        applyPosition(getDefaultPosition(viewport()));
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    void loadSettings().then((loadedSettings) => {
      settings = loadedSettings;
      mountUi();
    });
  },
});
