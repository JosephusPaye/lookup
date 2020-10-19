import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { synonyms } from '../';
import { wordWebOnline } from '../dist/adapters/wordwebonline.js';

test('synonyms() throws `WORD_EMPTY` for an empty word', async () => {
  try {
    await synonyms('');
    assert.not.ok(true, 'did not throw for empty word');
  } catch (err) {
    assert.ok(true, 'threw for empty word');
    assert.is(err.type, 'WORD_EMPTY');
  }
});

test('synonyms() throws `UNKNOWN_SOURCE` for an unknown source', async () => {
  try {
    await synonyms('set', { source: 'fake' });
    assert.not.ok(true, 'did not throw for unknown source');
  } catch (err) {
    assert.ok(true, 'threw for unknown source');
    assert.is(err.type, 'UNKNOWN_SOURCE');
  }
});

test('synonyms() throws `SOURCE_REQUEST_FAILED` for error requesting source', async () => {
  const url = wordWebOnline.url;

  wordWebOnline.url = () =>
    'http://this-is-an-invalid-url-to-test-an-http-error-when-requesting-the-source';

  try {
    await synonyms('something');
    assert.not.ok(true, 'did not throw for request error');
  } catch (err) {
    assert.ok(true, 'threw for request error');
    assert.is(err.type, 'SOURCE_REQUEST_FAILED');
    assert.ok(err.originalError);
  }

  wordWebOnline.url = url;
});

test('synonyms() throws `NOT_FOUND` for source HTML that fails adapter validation', async () => {
  try {
    await synonyms('fakefakefakeword');
    assert.not.ok(
      true,
      'did not throw for source HTML that fails adapter validation'
    );
  } catch (err) {
    assert.ok(true, 'threw for source HTML that fails adapter validation');
    assert.is(err.type, 'NOT_FOUND');
  }
});

test('synonyms() throws `EXTRACTION_FAILED` for an error when parsing synonyms', async () => {
  const oldGetSynonyms = wordWebOnline.getSynonyms;

  wordWebOnline.getSynonyms = () => {
    throw Error('oops');
  };

  try {
    await synonyms('word');
    assert.not.ok(true, 'did not throw for error during parsing');
  } catch (err) {
    assert.ok(true, 'threw for error during parsing');
    assert.is(err.type, 'EXTRACTION_FAILED');
    assert.ok(err.originalError);
  }

  wordWebOnline.getSynonyms = oldGetSynonyms;
});

test('synonyms() gets the synonyms of a word', async () => {
  const { synonyms: synonymsResult } = await synonyms('set');

  assert.ok(synonymsResult.length > 0, '"set" has at least one synonym');

  assert.is(synonymsResult[0].synonym, 'put', 'synonym includes the synonym');
  assert.is(
    synonymsResult[0].partOfSpeech,
    'verb',
    'synonym includes the part of speech'
  );
  assert.is(
    synonymsResult[0].word,
    'set',
    'synonym includes the matching word'
  );
  assert.is(
    synonymsResult[0].definition,
    'Cause to have a certain (possibly abstract) location',
    'synonym includes definition'
  );
});

test.run();
