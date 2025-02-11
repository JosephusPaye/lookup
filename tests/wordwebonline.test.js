import fs from 'fs';
import path from 'path';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import cheerio from 'cheerio';

import { wordWebOnline } from '../dist/adapters/wordwebonline.js';

const setHtml = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'set.wordwebonline.html'),
  'utf-8'
);

const fableHtml = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'fable.wordwebonline.html'),
  'utf-8'
);

const rapMusicHtml = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'rapmusic.wordwebonline.html'),
  'utf-8'
);

const colourHtml = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'colour.wordwebonline.html'),
  'utf-8'
);

const barbieHtml = fs.readFileSync(
  path.join(__dirname, 'fixtures', 'barbie.wordwebonline.html'),
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

test('wordWebOnline.getSynonyms() result has the expected shape', () => {
  const $ = cheerio.load(setHtml);
  const result = wordWebOnline.getSynonyms($, 'set', 'en');

  assert.type(result.attribution, 'string', '.attribution is of type string');
  assert.instance(result.synonyms, Array, '.synonyms is of type array');
});

test('wordWebOnline.getSynonyms() result includes attribution', () => {
  const $ = cheerio.load(setHtml);
  const result = wordWebOnline.getSynonyms($, 'set', 'en');
  assert.ok(result.attribution);
});

test('wordWebOnline.getSynonyms() result includes expected synonyms', () => {
  const $ = cheerio.load(setHtml);
  const { synonyms } = wordWebOnline.getSynonyms($, 'set', 'en');

  assert.ok(synonyms.length > 0, '"set" has at least one synonym');

  const synonym = synonyms[0];

  assert.is(synonym.synonym, 'put', 'synonym includes the synonym');
  assert.is(
    synonym.partOfSpeech,
    'verb',
    'synonym includes the part of speech'
  );
  assert.is(synonym.word, 'set', 'synonym includes the matching word');
  assert.is(
    synonym.definition,
    'Cause to have a certain (possibly abstract) location',
    'synonym includes definition'
  );
});

// https://github.com/JosephusPaye/lookup/issues/1
test('wordWebOnline.getDefinitions() works for meanings marked "archaic"', () => {
  const $ = cheerio.load(fableHtml);
  const { meanings } = wordWebOnline.getDefinitions($, 'fable', 'en', []);

  assert.ok(meanings.length > 0, '"fable" has at least one meaning');

  assert.is(
    meanings[1].word,
    'fable',
    'meaning includes word spelt according to meaning'
  );
  assert.is(
    meanings[1].partOfSpeech,
    'verb',
    'meaning includes part of speech'
  );
  assert.equal(meanings[1].forms, [], 'archaic verb "fable" has no forms');
  assert.equal(
    meanings[1].pronunciation,
    { text: 'fey-bul', key: '/ey/ day /u/ agree' },
    'meaning includes pronunciation key without label'
  );
  assert.ok(
    meanings[1].definitions.length > 0,
    'meaning includes at least one definition'
  );

  assert.is(
    meanings[1].definitions[0].definition,
    'Invent; speak of as true or real',
    'definition object includes definition text'
  );
});

// https://github.com/JosephusPaye/lookup/issues/2
test('wordWebOnline.getDefinitions() works for meanings without a pronunciation', () => {
  const $ = cheerio.load(rapMusicHtml);
  const { meanings } = wordWebOnline.getDefinitions($, 'rap music', 'en', []);

  assert.ok(meanings.length > 0, '"rap music" has at least one meaning');

  assert.is(
    meanings[0].word,
    'rap music',
    'meaning includes word spelt according to meaning'
  );
  assert.is(
    meanings[0].partOfSpeech,
    'noun',
    'meaning includes part of speech'
  );
  assert.equal(meanings[0].forms, [], 'noun "rap music" has no forms');
  assert.is(
    meanings[0].pronunciation,
    undefined,
    'compound word "rap music" doesn\' include a pronunciation'
  );
  assert.ok(
    meanings[0].definitions.length > 0,
    'meaning includes at least one definition'
  );

  assert.is(
    meanings[0].definitions[0].definition,
    'Genre of African-American music of the 1980s and 1990s in which rhyming lyrics are chanted to a musical accompaniment; several forms of rap have emerged',
    'definition object includes definition text'
  );
});

test('wordWebOnline.getDefinitions() includes word usage and alternatives', () => {
  let $ = cheerio.load(fableHtml);
  let results = wordWebOnline.getDefinitions($, 'fable', 'en', []);

  assert.ok(results.meanings.length > 0, '"fable" has at least one meaning');

  assert.equal(
    results.meanings[1].usage,
    ['archaic'],
    '"fable" has a meaning marked "archaic"'
  );

  $ = cheerio.load(colourHtml);
  results = wordWebOnline.getDefinitions($, 'colour', 'en', []);

  assert.ok(results.meanings.length > 0, '"colour" has at least one meaning');

  assert.equal(
    results.meanings[0].usage,
    ['Brit', 'Cdn'],
    '"colour" is used in Britain and Canada'
  );
  assert.equal(
    results.meanings[0].usageAlternative,
    { where: 'US', word: 'color' },
    '"color" is the alternative usage in the US'
  );

  $ = cheerio.load(barbieHtml);
  results = wordWebOnline.getDefinitions($, 'barbie', 'en', []);

  assert.ok(results.meanings.length > 0, '"barbie" has at least one meaning');

  assert.equal(
    results.meanings[0].usage,
    ['Brit', 'informal'],
    '"barbie" is used in Britain and Canada'
  );
  assert.equal(results.meanings[0].usageAlternative, undefined);
});

test.run();
