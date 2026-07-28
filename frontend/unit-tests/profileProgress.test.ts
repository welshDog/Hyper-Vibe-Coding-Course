/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';

import { buildModuleProgressSummary } from '../src/lib/profileProgress.ts';

test('buildModuleProgressSummary reports started module progress', () => {
  assert.deepStrictEqual(
    buildModuleProgressSummary({ completedModules: 3, totalModules: 12 }),
    {
      completedModules: 3,
      totalModules: 12,
      completionPercent: 25,
      statValue: '3/12',
      summaryLabel: '3 of 12 modules complete',
    },
  );
});

test('buildModuleProgressSummary keeps empty progress honest', () => {
  assert.deepStrictEqual(
    buildModuleProgressSummary({ completedModules: 0, totalModules: 12 }),
    {
      completedModules: 0,
      totalModules: 12,
      completionPercent: 0,
      statValue: '0/12',
      summaryLabel: '0 of 12 modules complete',
    },
  );
});

test('buildModuleProgressSummary caps completion at the module total', () => {
  assert.deepStrictEqual(
    buildModuleProgressSummary({ completedModules: 20, totalModules: 12 }),
    {
      completedModules: 12,
      totalModules: 12,
      completionPercent: 100,
      statValue: '12/12',
      summaryLabel: 'All 12 modules complete',
    },
  );
});
