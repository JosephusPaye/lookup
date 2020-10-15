import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { lookUp } from '../dist/main.js';
import { wordWebOnline } from '../dist/adapters/wordwebonline.js';

test('lookUp() throws `WORD_EMPTY` for an empty word', async () => {
  try {
    await lookUp('', 'en');
    assert.not.ok(true, 'did not throw for empty word');
  } catch (err) {
    assert.ok(true, 'threw for empty word');
    assert.is(err.type, 'WORD_EMPTY');
  }
});

test('lookUp() throws `UNKNOWN_SOURCE` for an unknown source', async () => {
  try {
    await lookUp('set', 'en', { source: 'fake' });
    assert.not.ok(true, 'did not throw for unknown source');
  } catch (err) {
    assert.ok(true, 'threw for unknown source');
    assert.is(err.type, 'UNKNOWN_SOURCE');
  }
});

test('lookUp() throws `SOURCE_REQUEST_FAILED` for error requesting source', async () => {
  const url = wordWebOnline.url;

  wordWebOnline.url = () =>
    'http://this-is-an-invalid-url-to-test-an-http-error-when-requesting-the-source';

  try {
    await lookUp('something', 'en');
    assert.not.ok(true, 'did not throw for request error');
  } catch (err) {
    assert.ok(true, 'threw for request error');
    assert.is(err.type, 'SOURCE_REQUEST_FAILED');
    assert.ok(err.originalError);
  }

  wordWebOnline.url = url;
});

test('lookUp() throws `NOT_FOUND` for source HTML that fails adapter validation', async () => {
  try {
    await lookUp('fakefakefakeword', 'en');
    assert.not.ok(
      true,
      'did not throw for source HTML that fails adapter validation'
    );
  } catch (err) {
    assert.ok(true, 'threw for source HTML that fails adapter validation');
    assert.is(err.type, 'NOT_FOUND');
  }
});

test('lookUp() throws `EXTRACTION_FAILED` for an error during parsing', async () => {
  const oldParse = wordWebOnline.parse;

  wordWebOnline.parse = () => {
    throw Error('oops');
  };

  try {
    await lookUp('word', 'en');
    assert.not.ok(true, 'did not throw for error during parsing');
  } catch (err) {
    assert.ok(true, 'threw for error during parsing');
    assert.is(err.type, 'EXTRACTION_FAILED');
    assert.ok(err.originalError);
  }

  wordWebOnline.parse = oldParse;
});

test('lookUp() includes only related antonyms by default', async () => {
  const result = await lookUp('set', 'en');

  assert.is(result.soundsLike.length, 0);
  assert.is(result.derivedForms.length, 0);
  assert.is(result.seeAlso.length, 0);
  assert.is(result.typeOf.length, 0);
  assert.is(result.partOf.length, 0);
  assert.is(result.nearest.before.length, 0);
  assert.is(result.nearest.after.length, 0);

  assert.ok(result.antonyms.length > 0, '"set" has at least one antonym');
});

test('lookUp() includes related terms requested', async () => {
  const result = await lookUp('set', 'en', {
    includeRelated: [
      'soundsLike',
      'derivedForms',
      'seeAlso',
      'typeOf',
      'partOf',
      'nearest',
      'antonyms',
    ],
  });

  assert.ok(
    result.soundsLike.length > 0,
    '"set" has at least one related word in `soundsLike`'
  );
  assert.ok(
    result.derivedForms.length > 0,
    '"set" has at least one related word in `derivedForms`'
  );
  assert.ok(
    result.seeAlso.length > 0,
    '"set" has at least one related word in `seeAlso`'
  );
  assert.ok(
    result.typeOf.length > 0,
    '"set" has at least one related word in `typeOf`'
  );
  assert.ok(
    result.partOf.length > 0,
    '"set" has at least one related word in `partOf`'
  );
  assert.ok(
    result.nearest.before.length > 0,
    '"set" has at least one related word in `nearest.before`'
  );
  assert.ok(
    result.nearest.after.length > 0,
    '"set" has at least one related word in `nearest.after`'
  );

  assert.ok(result.antonyms.length > 0, '"set" has at least one antonym');
});

test.run();
