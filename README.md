# Lookup

📖 Lookup definitions and synonyms of words using online sources. Designed for Node.js.

This project is part of [#CreateWeekly](https://twitter.com/JosephusPaye/status/1214853295023411200), my attempt to create something new publicly every week in 2020.

## How it works

Lookup provides a common interface for looking up definitions and synonyms of words using various online sources. An adapter is used to implement this interface for each source. Currently, the available sources are:

- [WordWeb Online](https://www.wordwebonline.com/)

## Installation

```
npm install @josephuspaye/lookup --save
```

## Usage

### Look up definitions

The following example looks up definitions of the word "map":

```js
const lookup = require('@josephuspaye/lookup');

async function main() {
  try {
    const { attribution, meanings } = await lookup.definitions('map');
    console.log({ attribution, meanings });
  } catch (error) {
    console.log('unable to look up definitions', error);
  }
}

main();
```

And yields the following output when ran:

<details>
<summary>View output</summary>

```js
{
  attribution: 'Definitions from WordWebOnline',
  meanings: [
    {
      word: 'map',
      partOfSpeech: 'noun',
      forms: [],
      pronunciation: { text: 'map', key: '/a/ fat' },
      definitions: [
        {
          definition: "A diagrammatic representation of the earth's surface (or part of it)",
          examples: [],
          synonyms: []
        },
        {
          definition: '(mathematics) a mathematical relation such that each element of a given set (the domain of the function) is associated with an element of another set (the range of the function)',
          examples: [],
          synonyms: [
            'function',
            'mathematical function',
            'single-valued function',
            'mapping'
          ]
        }
      ]
    },
    {
      word: 'map',
      partOfSpeech: 'verb',
      forms: [ 'mapped', 'mapping' ],
      pronunciation: { text: 'map', key: '/a/ fat' },
      definitions: [
        {
          definition: 'Make a map of; show or establish the features or details of',
          examples: [ 'map the surface of Venus' ],
          synonyms: []
        },
        {
          definition: 'Explore or survey for the purpose of making a map',
          examples: [
            "We haven't even begun to map the many galaxies that we know exist"
          ],
          synonyms: []
        },
        {
          definition: 'Locate within a specific region of a chromosome in relation to known DNA or gene sequences',
          examples: [ 'map the genes' ],
          synonyms: []
        },
        {
          definition: 'Plan, delineate, or arrange in detail',
          examples: [ "map one's future" ],
          synonyms: [ 'map out' ]
        },
        {
          definition: 'Depict as if on a map',
          examples: [ "sorrow was mapped on the mother's face" ],
          synonyms: []
        },
        {
          definition: 'To establish a mapping (of mathematical elements or sets)',
          examples: [],
          synonyms: [ 'represent' ]
        }
      ]
    }
  ]
}
```

</details>

### Look up related words

When looking up definitions, you can choose to include related words in the following categories:

- `soundsLike`
- `derivedForms`
- `seeAlso`
- `typeOf`
- `partOf`
- `antonyms`
- `nearest`

The following example finds `derivedForms`, `typeOf`, and `nearest` relations for the word "fiction":

```js
const lookup = require('@josephuspaye/lookup');

async function main() {
  try {
    const { derivedForms, partOf, nearest } = await lookup.definitions(
      'fiction',
      {
        includeRelated: ['derivedForms', 'typeOf', 'nearest'],
      }
    );
    console.log({ derivedForms, partOf, nearest });
  } catch (error) {
    console.log('unable to look up related words', error);
  }
}

main();
```

And yields the following output when ran:

<details>
<summary>View output</summary>

```js
{
  derivedForms: [ 'fictions' ],
  typeOf: [
    'creative thinking',
    'creativeness',
    'creativity',
    'falsehood',
    'falsity',
    'literary composition',
    'literary work',
    'untruth'
  ],
  nearest: {
    before: [
      'fibular', 'fibular vein',
      'FICA',    'fice',
      'fiche',   'fichu',
      'fickle',  'fickleness',
      'fico',    'fictile'
    ],
    after: [
      'fictional',
      'fictional animal',
      'fictional character',
      'fictionalisation',
      'fictionalise',
      'fictionalization',
      'fictionalize',
      'fictitious',
      'fictitious character',
      'fictitious name'
    ]
  }
}
```

</details>

### Look up synonyms

The following example looks up synonyms of the word "reticent":

```js
const lookup = require('@josephuspaye/lookup');

async function main() {
  try {
    const { attribution, synonyms } = await lookup.synonyms('reticent');
    console.log({ attribution, synonyms });
  } catch (error) {
    console.log('unable to look up synonyms', error);
  }
}

main();
```

And yields the following output when ran:

<details>
<summary>View output</summary>

```js
{
  attribution: 'Definitions from WordWebOnline',
  synonyms: [
    {
      definition: 'Temperamentally disinclined to talk',
      partOfSpeech: 'adjective',
      synonym: 'untalkative',
      word: 'reticent'
    },
    {
      definition: 'Cool and formal in manner',
      partOfSpeech: 'adjective',
      synonym: 'restrained',
      word: 'reticent'
    },
    {
      definition: 'Cool and formal in manner',
      partOfSpeech: 'adjective',
      synonym: 'unemotional',
      word: 'reticent'
    },
    {
      definition: 'Reluctant to draw attention to yourself',
      partOfSpeech: 'adjective',
      synonym: 'self-effacing',
      word: 'reticent'
    },
    {
      definition: 'Reluctant to draw attention to yourself',
      partOfSpeech: 'adjective',
      synonym: 'retiring',
      word: 'reticent'
    }
  ]
}
```

</details>

## API

### `lookup.definitions()`

Look up definitions and words related to the given word. Will throw on errors. See below for type definitions and errors.

```ts
async function definitions(
  word: string,
  options?: {
    language?: Lookup.Language;
    source?: Lookup.Source;
    includeRelated?: Lookup.Related[];
  }
): Promise<Lookup.DefinitionsResult>;
```

### `lookup.synonyms()`

Look up synonyms of the given word. Will throw on errors. See below for type definitions and errors.

```ts
async function synonyms(
  word: string,
  options: {
    language?: Lookup.Language;
    source?: Lookup.Source;
  }
): Promise<Lookup.SynonymsResult>;
```

### Types

The following types are used for parameters and return values.

```ts
export namespace Lookup {
  /**
   * The sources available for looking up words.
   */
  export type Source = 'wordWebOnline';

  /**
   * Types of related words
   */
  export type Related =
    | 'soundsLike'
    | 'derivedForms'
    | 'seeAlso'
    | 'typeOf'
    | 'partOf'
    | 'antonyms'
    | 'nearest';

  /**
   * The available languages
   */
  export type Language = 'en';

  /**
   * A definition
   */
  export interface Definition {
    /**
     * The definition text
     */
    definition: string;

    /**
     * Zero or more examples of the definition
     */
    examples: string[];

    /**
     * Zero or more synonyms of the word matching the definition
     */
    synonyms: string[];
  }

  /**
   * A meaning (sense). One word can have multiple meanings,
   * and each meaning can have multiple definitions.
   */
  export interface Meaning {
    /**
     * The word with this meaning
     */
    word: string;

    /**
     * The part of speech of the word with this meaning
     */
    partOfSpeech: string;

    /**
     * For verbs, the forms (e.g. present, past, present progressive, etc)
     */
    forms: string[];

    /**
     * The pronunciation for this meaning
     */
    pronunciation: {
      /**
       * The pronunciation text
       */
      text: string;

      /**
       * The pronunciation key
       */
      key?: string;

      /**
       * URL to an audio file with the pronunciation
       */
      audioUrl?: string;
    };

    /**
     * The definitions of the word with this meaning
     */
    definitions: Definition[];
  }

  /**
   * A definition result
   */
  export interface DefinitionsResult {
    /**
     * Attribution for where the definitions are from
     */
    attribution: string;

    /**
     * The meanings found for the given word
     */
    meanings: Meaning[];

    /**
     * Zero or more words that sound like the given word
     */

    soundsLike: string[];

    /**
     * Derived forms of the given word (e.g. tenses)
     */
    derivedForms: string[];

    /**
     * Zero or more words that are similar to the given word
     */
    seeAlso: string[];

    /**
     * Zero or more words that the given words is a semantic type of
     */
    typeOf: string[];

    /**
     * Zero or more words that the given word is a semantic part of
     */
    partOf: string[];

    /**
     * Zero or more words that are antonyms of the given word
     */
    antonyms: string[];

    /**
     * Words nearest to the given word in the database
     */
    nearest: {
      /**
       * Zero or more words that appear immediately before the given word in the databse
       */
      before: string[];

      /**
       * Zero or more words that appear immediately after the given word in the databse
       */
      after: string[];
    };
  }

  /**
   * A synonym result
   */
  export interface Synonym {
    /**
     * The synonym
     */
    synonym: string;

    /**
     * The word with this synonym
     */
    word: string;

    /**
     * The part of speech of the word with this synonym
     */
    partOfSpeech: string;

    /**
     * The definition of the word matching this synonym
     */
    definition: string;
  }

  export interface SynonymsResult {
    /**
     * Attribution for where the definitions are from
     */
    attribution: string;

    /**
     * The synonyms found for the given word
     */
    synonyms: Synonym[];
  }
}
```

### Errors

`lookup.definitions()` and `lookup.synonyms()` may throw errors matching the following interface:

```ts
/**
 * A look up error.
 */
interface Error {
  type: ErrorType;
  message: string;
  originalError?: any;
}
```

Where `type` is a member of the following enum:

```ts
/**
 * The errors that could occur when looking up words.
 */
enum ErrorType {
  /**
   * The given word is empty
   */
  'WORD_EMPTY',

  /**
   * Request to the source website failed
   */
  'SOURCE_REQUEST_FAILED',

  /**
   * The given source was not recognized
   */
  'UNKNOWN_SOURCE',

  /**
   * The word was not found on the source page, perhaps the page format changed
   */
  'NOT_FOUND',

  /**
   * Unable to extract the definitions from the source page
   */
  'EXTRACTION_FAILED',
}
```

## Licence

[MIT](LICENCE)
