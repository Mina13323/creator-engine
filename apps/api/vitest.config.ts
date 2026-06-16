import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', '../packages/agents/src/**/*.ts'],
      exclude: ['src/env.ts', 'src/index.ts', '**/*.d.ts'],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
