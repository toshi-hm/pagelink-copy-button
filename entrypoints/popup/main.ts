import { loadSettings, saveSettings } from '../../src/storage';

const visibleInput = document.querySelector<HTMLInputElement>('#visible');
const resetButton = document.querySelector<HTMLButtonElement>('#reset-position');
const status = document.querySelector<HTMLParagraphElement>('#status');

function setStatus(message: string) {
  if (status) {
    status.textContent = message;
  }
}

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function sendToActiveTab(message: unknown) {
  const tabId = await getActiveTabId();
  if (tabId === undefined) {
    return;
  }

  try {
    await browser.tabs.sendMessage(tabId, message);
  } catch (error: unknown) {
    console.debug('[PageLink Copy Button] Active tab does not accept messages', error);
  }
}

async function initialize() {
  const settings = await loadSettings();
  if (visibleInput) {
    visibleInput.checked = settings.visible;
  }
}

visibleInput?.addEventListener('change', () => {
  const visible = visibleInput.checked;
  void loadSettings().then((settings) =>
    saveSettings({ ...settings, visible }).then(() =>
      sendToActiveTab({ type: 'set-visible', visible }),
    ),
  );
  setStatus(visible ? 'ボタンを表示しました' : 'ボタンを非表示にしました');
});

resetButton?.addEventListener('click', () => {
  void loadSettings().then((settings) =>
    saveSettings({ ...settings, position: null }).then(() =>
      sendToActiveTab({ type: 'reset-position' }),
    ),
  );
  setStatus('位置を右下に戻しました');
});

void initialize();
