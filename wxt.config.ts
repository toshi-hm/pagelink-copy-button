import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'PageLink Copy Button',
    description: 'ページタイトルと URL をハイパーリンクとしてコピーします。',
    permissions: ['clipboardWrite'],
  },
});
