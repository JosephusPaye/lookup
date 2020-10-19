import fs from 'fs';
import path from 'path';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import cheerio from 'cheerio';

import { wordWebOnline } from '../dist/adapters/wordwebonline.js';

const setHtml = fs.readFileSync(
  path.join(__dirname, 'set.wordwebonline.html'),
  'utf-8'
);

test('wordWebOnline.url() creates and normalizes URL', () => {
  assert.is(
    wordWebOnline.url('reTicEnt', 'eN'),
    'https://www.wordwebonline.com/en/RETICENT',
    'Normalizes the word to uppercase and the language to lowercase'
  );

  assert.is(
    wordWebOnline.url('united states of america', 'en'),
    'https://www.wordwebonline.com/en/UNITEDSTATESOFAMERICA',
    'Removes spaces in the word'
  );

  assert.is(
    wordWebOnline.url('e-mail-server', 'en'),
    'https://www.wordwebonline.com/en/EMAILSERVER',
    'Removes hyphens in the word'
  );

  assert.is(
    wordWebOnline.url('U.S.A', 'en'),
    'https://www.wordwebonline.com/en/USA',
    'Removes dots in the word'
  );

  assert.is(
    wordWebOnline.url('20/20', 'en'),
    'https://www.wordwebonline.com/en/2020',
    'Removes dots in the word'
  );
});

test('wordWebOnline.getDefinitions() result has the expected shape', () => {
  const $ = cheerio.load(setHtml);
  const result = wordWebOnline.getDefinitions($, 'set', 'en', []);

  // .attribution
  assert.type(result.attribution, 'string', '.attribution is of type string');

  // .meanings
  assert.instance(result.meanings, Array, '.meanings is of type array');

  // .soundsLike
  assert.instance(result.soundsLike, Array, '.soundsLike is of type array');

  // .derivedForms
  assert.instance(result.derivedForms, Array, '.derivedForms is of type array');

  // .seeAlso
  assert.instance(result.seeAlso, Array, '.seeAlso is of type array');

  // .typeOf
  assert.instance(result.typeOf, Array, '.typeOf is of type array');

  // .partOf
  assert.instance(result.partOf, Array, '.partOf is of type array');

  // .antonyms
  assert.instance(result.antonyms, Array, '.antonyms is of type array');

  // .nearest
  assert.type(result.nearest, 'object', '.nearest is of type object');
  assert.instance(
    result.nearest.before,
    Array,
    '.nearest.before is of type array'
  );
  assert.instance(
    result.nearest.after,
    Array,
    '.nearest.after is of type array'
  );
});

test('wordWebOnline.getDefinitions() result includes attribution', () => {
  const $ = cheerio.load(setHtml);
  const result = wordWebOnline.getDefinitions($, 'set', 'en', []);
  assert.ok(result.attribution);
});

test('wordWebOnline.getDefinitions() result includes expected meanings', () => {
  const $ = cheerio.load(setHtml);
  const { meanings } = wordWebOnline.getDefinitions($, 'set', 'en', []);

  // "set" has 4 distinct meanings: verb, noun, adjective, proper noun
  assert.is(meanings.length, 4, 'a word can have multiple distinct meanings');

  // Meaning
  const meaning = meanings[0];

  assert.is(
    meaning.word,
    'set',
    'meaning includes word spelt according to meaning'
  );
  assert.is(meaning.partOfSpeech, 'verb', 'meaning includes part of speech');
  assert.equal(
    meaning.forms,
    ['set', 'setting'],
    'verb meaning includes forms'
  );
  assert.equal(
    meaning.pronunciation,
    { text: 'set', key: '/e/ egg' },
    'meaning includes pronunciation key without label'
  );
  assert.ok(
    meaning.definitions.length > 0,
    'meaning includes at least one definition'
  );

  // Definition
  const definition = meaning.definitions[0];

  assert.is(
    definition.definition,
    'Cause to have a certain (possibly abstract) location',
    'definition object includes definition text'
  );
  assert.equal(
    definition.examples,
    ['Set the tray down'],
    'a definition can include an example (without delimiters)'
  );
  assert.equal(
    definition.synonyms,
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

test('wordWebOnline.getDefinitions() result includes related words when requested', () => {
  const $ = cheerio.load(setHtml);

  const { soundsLike } = wordWebOnline.getDefinitions($, 'set', 'en', [
    'soundsLike',
  ]);
  assert.ok(soundsLike.length > 0, 'includes soundsLike when requested');

  const { derivedForms } = wordWebOnline.getDefinitions($, 'set', 'en', [
    'derivedForms',
  ]);
  assert.ok(derivedForms.length > 0, 'includes derivedForms when requested');

  const { seeAlso } = wordWebOnline.getDefinitions($, 'set', 'en', ['seeAlso']);
  assert.ok(seeAlso.length > 0, 'includes seeAlso when requested');

  const { typeOf } = wordWebOnline.getDefinitions($, 'set', 'en', ['typeOf']);
  assert.ok(typeOf.length > 0, 'includes typeOf when requested');

  const { partOf } = wordWebOnline.getDefinitions($, 'set', 'en', ['partOf']);
  assert.ok(partOf.length > 0, 'includes partOf when requested');

  const { antonyms } = wordWebOnline.getDefinitions($, 'set', 'en', [
    'antonyms',
  ]);
  assert.ok(antonyms.length > 0, 'includes antonyms when requested');

  const { nearest } = wordWebOnline.getDefinitions($, 'set', 'en', ['nearest']);
  assert.ok(
    nearest.before.length > 0,
    'includes nearest.before when requested'
  );
  assert.ok(nearest.after.length > 0, 'includes nearest.after when requested');
});

test.run();
