export type LinkPayload = {
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] ?? character,
  );
}

export function createLinkPayload(title: string, url: string): LinkPayload {
  const safeTitle = escapeHtml(title);
  const safeUrl = escapeHtml(url);

  return {
    html: `<a href="${safeUrl}">${safeTitle}</a>`,
    text: `${title} (${url})`,
  };
}

export async function copyLink(payload: LinkPayload): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error('Clipboard API is unavailable');
  }

  const item = new ClipboardItem({
    'text/html': new Blob([payload.html], { type: 'text/html' }),
    'text/plain': new Blob([payload.text], { type: 'text/plain' }),
  });

  await navigator.clipboard.write([item]);
}
