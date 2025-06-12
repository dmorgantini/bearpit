import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    exclude: ['node_modules/**', 'dist/**', '.next/**'],
    coverage: {
      include: ['lib/**/*.js', 'utils/**/*.js'],
      exclude: [
        'lib/**/*.test.js',
        'lib/**/__tests__/**',
        'fairness_analysis_runner.js',
        'index.js'
      ],
      reporter: ['text', 'html']
    },
    globals: true, // Optional: provides global describe, it, expect
    testTimeout: 10000 // 10 seconds for longer tournament simulations
  }
});