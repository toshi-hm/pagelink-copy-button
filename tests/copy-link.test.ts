import { describe, expect, test } from 'bun:test';

import { createLinkPayload } from '../src/copy-link';

describe('createLinkPayload', () => {
  test('creates rich and plain text clipboard values', () => {
    expect(createLinkPayload('Example page', 'https://example.com/docs')).toEqual({
      html: '<a href="https://example.com/docs">Example page</a>',
      text: 'Example page (https://example.com/docs)',
    });
  });

  test('escapes HTML-sensitive titles and URLs', () => {
    expect(createLinkPayload('<Docs & Notes>', 'https://example.com/?a=1&b=2')).toEqual({
      html: '<a href="https://example.com/?a=1&amp;b=2">&lt;Docs &amp; Notes&gt;</a>',
      text: '<Docs & Notes> (https://example.com/?a=1&b=2)',
    });
  });
});
