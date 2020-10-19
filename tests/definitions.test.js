import { test } from 'uvu';
import * as assert from 'uvu/assert';

import { definitions } from '../';
import { wordWebOnline } from '../dist/adapters/wordwebonline.js';

test('definitions() throws `WORD_EMPTY` for an empty word', async () => {
  try {
    await definitions('');
    assert.not.ok(true, 'did not throw for empty word');
  } catch (err) {
    assert.ok(true, 'threw for empty word');
    assert.is(err.type, 'WORD_EMPTY');
  }
});

test('definitions() throws `UNKNOWN_SOURCE` for an unknown source', async () => {
  try {
    await definitions('set', { source: 'fake' });
    assert.not.ok(true, 'did not throw for unknown source');
  } catch (err) {
    assert.ok(true, 'threw for unknown source');
    assert.is(err.type, 'UNKNOWN_SOURCE');
  }
});

test('definitions() throws `SOURCE_REQUEST_FAILED` for error requesting source', async () => {
  const url = wordWebOnline.url;

  wordWebOnline.url = () =>
    'http://this-is-an-invalid-url-to-test-an-http-error-when-requesting-the-source';

  try {
    await definitions('something');
    assert.not.ok(true, 'did not throw for request error');
  } catch (err) {
    assert.ok(true, 'threw for request error');
    assert.is(err.type, 'SOURCE_REQUEST_FAILED');
    assert.ok(err.originalError);
  }

  wordWebOnline.url = url;
});

test('definitions() throws `NOT_FOUND` for source HTML that fails adapter validation', async () => {
  try {
    await definitions('fakefakefakeword');
    assert.not.ok(
      true,
      'did not throw for source HTML that fails adapter validation'
    );
  } catch (err) {
    assert.ok(true, 'threw for source HTML that fails adapter validation');
    assert.is(err.type, 'NOT_FOUND');
  }
});

test('definitions() throws `EXTRACTION_FAILED` for an error when parsing definitions', async () => {
  const oldGetDefinitions = wordWebOnline.getDefinitions;

  wordWebOnline.getDefinitions = () => {
    throw Error('oops');
  };

  try {
    await definitions('word');
    assert.not.ok(true, 'did not throw for error during parsing');
  } catch (err) {
    assert.ok(true, 'threw for error during parsing');
    assert.is(err.type, 'EXTRACTION_FAILED');
    assert.ok(err.originalError);
  }

  wordWebOnline.getDefinitions = oldGetDefinitions;
});

test('definitions() includes only related antonyms by default', async () => {
  const result = await definitions('set');

  assert.is(result.soundsLike.length, 0);
  assert.is(result.derivedForms.length, 0);
  assert.is(result.seeAlso.length, 0);
  assert.is(result.typeOf.length, 0);
  assert.is(result.partOf.length, 0);
  assert.is(result.nearest.before.length, 0);
  assert.is(result.nearest.after.length, 0);

  assert.ok(result.antonyms.length > 0, '"set" has at least one antonym');
});

test('definitions() includes related terms requested', async () => {
  const result = await definitions('set', {
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

test('definitions() gets the definitions of a word', async () => {
  const { meanings } = await definitions('set');

  assert.ok(meanings.length > 0, '"set" has at least one meaning');

  assert.is(
    meanings[0].word,
    'set',
    'meaning includes word spelt according to meaning'
  );
  assert.is(
    meanings[0].partOfSpeech,
    'verb',
    'meaning includes part of speech'
  );
  assert.equal(
    meanings[0].forms,
    ['set', 'setting'],
    'verb meaning includes forms'
  );
  assert.equal(
    meanings[0].pronunciation,
    { text: 'set', key: '/e/ egg' },
    'meaning includes pronunciation key without label'
  );
  assert.ok(
    meanings[0].definitions.length > 0,
    'meaning includes at least one definition'
  );

  assert.is(
    meanings[0].definitions[0].definition,
    'Cause to have a certain (possibly abstract) location',
    'definition object includes definition text'
  );
  assert.equal(
    meanings[0].definitions[0].examples,
    ['Set the tray down'],
    'a definition can include an example (without delimiters)'
  );
  assert.equal(
    meanings[0].definitions[0].synonyms,
    ['put', 'place', 'pose', 'position', 'lay'],
    'a definition can include synonyms'
  );

  assert.equal(meanings[1].forms, [], 'noun meaning has no forms');
  assert.equal(
    meanings[1].definitions[0].examples,
    ['a set of books', 'a set of golf clubs', 'a set of teeth'],
    'a definition can include multiple examples (without delimiters)'
  );
});

test.run();
