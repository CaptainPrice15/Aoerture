import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyPhotosForTone,
  classifyTonePixels,
  getExplicitToneMatches,
  getPhotoTones
} from './toneClassifier.js';

function pixels(color, count) {
  return Array.from({ length: count }, () => color).flat();
}

function combine(...groups) {
  return groups.flat();
}

const red = [255, 0, 0, 255];
const green = [0, 255, 0, 255];
const blue = [0, 0, 255, 255];
const gray = [128, 128, 128, 255];

test('classifies distinct warm, emerald, blue, and purple samples', () => {
  assert.deepEqual(classifyTonePixels(pixels(red, 1024)), ['warm']);
  assert.deepEqual(classifyTonePixels(pixels(green, 1024)), ['emerald']);
  assert.deepEqual(classifyTonePixels(pixels(blue, 1024)), ['blue']);
  assert.deepEqual(classifyTonePixels(pixels([160, 0, 255, 255], 1024)), ['purple']);
});

test('allows one image to match multiple tone families', () => {
  const mixed = combine(pixels(red, 512), pixels(green, 512));
  assert.deepEqual(classifyTonePixels(mixed), ['warm', 'emerald']);
});

test('uses the 12 percent color threshold and ignores transparent pixels', () => {
  const atThreshold = combine(pixels(red, 120), pixels(blue, 880));
  const belowThreshold = combine(pixels(red, 119), pixels(blue, 881));
  assert.ok(classifyTonePixels(atThreshold).includes('warm'));
  assert.ok(!classifyTonePixels(belowThreshold).includes('warm'));

  const transparentRed = [255, 0, 0, 0];
  assert.deepEqual(classifyTonePixels(combine(pixels(transparentRed, 100), pixels(blue, 100))), ['blue']);
});

test('classifies monochrome only when at least 80 percent of pixels are low saturation', () => {
  const atThreshold = combine(pixels(gray, 820), pixels(red, 204));
  const belowThreshold = combine(pixels(gray, 819), pixels(red, 205));
  assert.ok(classifyTonePixels(atThreshold).includes('mono'));
  assert.ok(!classifyTonePixels(belowThreshold).includes('mono'));
});

test('matches only explicit canonical tone tags during fallback', () => {
  assert.equal(getExplicitToneMatches({ tags: 'travel; tone:blue' }, 'blue'), true);
  assert.equal(getExplicitToneMatches({ tags: ['Monochrome'] }, 'mono'), true);
  assert.equal(getExplicitToneMatches({ tags: ['warm portrait'] }, 'warm'), false);
});

test('uses explicit tags when image sampling is unavailable', async () => {
  const photo = { id: 'node-fallback-photo', tags: ['tone:emerald'] };
  assert.deepEqual(await getPhotoTones(photo), ['emerald']);
});

test('classifies a photo list with bounded workers and reports progress', async () => {
  const progress = [];
  const photos = [
    { id: 'fallback-1', tags: ['warm'] },
    { id: 'fallback-2', tags: ['blue'] },
    { id: 'fallback-3', tags: ['warm'] }
  ];
  const matches = await classifyPhotosForTone(photos, 'warm', {
    concurrency: 2,
    onProgress: (completed, total) => progress.push([completed, total])
  });

  assert.deepEqual([...matches].sort(), ['fallback-1', 'fallback-3']);
  assert.equal(progress.length, 3);
  assert.deepEqual(progress.at(-1), [3, 3]);
});
