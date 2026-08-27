import { defineBackground } from 'wxt/utils/define-background';

const MENU_IDS = {
  copy: 'pagelink-copy-button.copy',
  show: 'pagelink-copy-button.show',
  hide: 'pagelink-copy-button.hide',
} as const;

async function setupContextMenus() {
  await browser.contextMenus.removeAll();
  await Promise.all([
    browser.contextMenus.create({
      id: MENU_IDS.copy,
      title: 'ページリンクをコピー',
      contexts: ['page'],
    }),
    browser.contextMenus.create({
      id: MENU_IDS.show,
      title: 'PageLink ボタンを表示',
      contexts: ['page'],
    }),
    browser.contextMenus.create({
      id: MENU_IDS.hide,
      title: 'PageLink ボタンを非表示',
      contexts: ['page'],
    }),
  ]);
}

async function sendToTab(tabId: number, message: unknown) {
  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch (error: unknown) {
    console.debug('[PageLink Copy Button] Context menu target is unavailable', error);
  }
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    void setupContextMenus();
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab || tab.id === undefined) {
      return;
    }

    const tabId = tab.id;

    if (info.menuItemId === MENU_IDS.copy) {
      void sendToTab(tabId, { type: 'copy-current' });
      return;
    }

    if (info.menuItemId === MENU_IDS.show) {
      void sendToTab(tabId, { type: 'set-visible', visible: true });
      return;
    }

    if (info.menuItemId === MENU_IDS.hide) {
      void sendToTab(tabId, { type: 'set-visible', visible: false });
    }
  });
});
