import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Pin React version so eslint-plugin-react doesn't call the removed context.getFilename() API.
  { settings: { react: { version: '19.0.0' } } },
  // Disables ESLint rules that conflict with Prettier formatting.
  prettierConfig,
  // ---- Hexagonal layer boundaries (see CLAUDE.md) ----
  // domain/ imports nothing internal and no UI/framework libraries.
  {
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/application/*', '@/infrastructure/*', '@/presentation/*', '@/app/*'],
              message: 'domain/ must not import other layers (CLAUDE.md layer rules).',
            },
            {
              group: [
                'react',
                'react-dom',
                'next',
                'next/*',
                'next-intl',
                'next-intl/*',
                'zustand',
                'zustand/*',
                '@tanstack/*',
              ],
              message: 'domain/ must stay framework-free (CLAUDE.md layer rules).',
            },
          ],
        },
      ],
    },
  },
  // application/ imports only domain/ and must contain zero React.
  {
    files: ['src/application/**/*.{ts,tsx}'],
    ignores: ['src/application/container.ts'], // composition root — sanctioned infrastructure import
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/infrastructure/*',
                '@/presentation/*',
                '@/app/*',
                '**/infrastructure/**',
                '**/presentation/**',
              ],
              message: 'application/ may import only domain/ (CLAUDE.md layer rules).',
            },
            {
              group: [
                'react',
                'react-dom',
                'next-intl',
                'next-intl/*',
                'zustand',
                'zustand/*',
                '@tanstack/*',
              ],
              message: 'application/ must contain zero React imports (CLAUDE.md layer rules).',
            },
          ],
        },
      ],
    },
  },
  // infrastructure/ must not import presentation/ or app/.
  {
    files: ['src/infrastructure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/presentation/*', '@/app/*', '**/presentation/**'],
              message:
                'infrastructure/ must not import presentation/ or app/ (CLAUDE.md layer rules).',
            },
          ],
        },
      ],
    },
  },
  // presentation/ and app/ never import infrastructure/ directly.
  {
    files: ['src/presentation/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/infrastructure/*', '**/infrastructure/**'],
              message:
                'Use the application layer (e.g. getRepository from @/application/container) instead of importing infrastructure/ directly (CLAUDE.md layer rules).',
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'coverage/**']),
]);

export default eslintConfig;
