import path from 'node:path';
import { defineConfig } from '@modern-js/app-tools';
import type { AppUserConfig } from '@modern-js/app-tools';
const { SemiRspackPlugin } = require('@douyinfe/semi-rspack-plugin');

const config: AppUserConfig<'rspack'> = {
  plugins: [
    require('@modern-js/app-tools')({
      bundler: 'rspack',
    }),
  ],

  output: {
    disableTsChecker: true,
    disableSourceMap: false,
  },

  source: {
    entry: {
      main: './src/global.tsx',
    },
    // alias: {
    //   '@': './src',
    // },
  },

  server: {
    port: 3000,
  },

  tools: {
    tailwindcss: {},
    postcss: {},
    rspack: (config, { addRules }) => {
      // 完全禁用缓存
      config.cache = false;

      // 更精确的 SCSS 规则排除
      if (config.module?.rules) {
        for (const rule of config.module.rules) {
          if (
            rule !== '...' &&
            rule &&
            typeof rule === 'object' &&
            'test' in rule &&
            typeof rule.test === 'object' &&
            rule.test.toString() === '/\\.s(?:a|c)ss$/'
          ) {
            const mutableRule = rule as { exclude?: RegExp };
            mutableRule.exclude =
              /@douyinfe\/semi-(ui|icons|foundation)\/lib\/.+\.scss$/;
          }
        }
      }

      // 添加 SemiRspackPlugin 插件
      if (config.plugins) {
        config.plugins.push(
          new SemiRspackPlugin({
            theme: '@douyinfe/semi-theme-default',
            omitCss: false,
            cssLayer: true,
          }),
        );
      }

      // 配置 resolve.alias
      if (!config.resolve) {
        config.resolve = {};
      }
      if (!config.resolve.alias) {
        config.resolve.alias = {};
      }

      config.resolve.alias['@douyinfe/semi-ui'] = path.resolve(
        __dirname,
        'node_modules/@douyinfe/semi-ui',
      );
      config.resolve.alias['@douyinfe/semi-icons'] = path.resolve(
        __dirname,
        'node_modules/@douyinfe/semi-icons',
      );
      config.resolve.alias['@douyinfe/semi-foundation'] = path.resolve(
        __dirname,
        'node_modules/@douyinfe/semi-foundation',
      );

      return config;
    },
  },
};

export default defineConfig(config);
