export namespace Lookup {
  /**
   * The sources available for looking up words.
   */
  export type Source = 'wordWebOnline';

  /**
   * The errors that could occur when looking up words.
   */
  export enum ErrorType {
    /**
     * The given word is empty
     */
    'WORD_EMPTY' = 'WORD_EMPTY',

    /**
     * Request to the source website failed
     */
    'SOURCE_REQUEST_FAILED' = 'SOURCE_REQUEST_FAILED',

    /**
     * The given source was not recognized
     */
    'UNKNOWN_SOURCE' = 'UNKNOWN_SOURCE',

    /**
     * The word was not found on the source page, perhaps the page format changed
     */
    'NOT_FOUND' = 'NOT_FOUND',

    /**
     * Unable to extract the definitions from the source page
     */
    'EXTRACTION_FAILED' = 'EXTRACTION_FAILED',
  }

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
   * A look up result
   */
  export interface Result {
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

  export interface SourceAdapter {
    /**
     * Get attribution for the source, for user-level display.
     */
    attribution(): string;

    /**
     * Create a URL to look up the given word from the source.
     */
    url(word: string, language: string): string;

    /**
     * Fetch the HTML source of the given URL.
     */
    fetch?(url: string): Promise<string>;

    /**
     * Verify that the HTML page fetched from the source is as expected.
     * Recommended to look for a unique value in the HTML that indicates
     * a valid definition was returned on the page.
     */
    validate(html: string, word: string, language: string): boolean;

    /**
     * Parse the source HTML page to extract meanings using cheerio.
     */
    parse(
      $html: cheerio.Root,
      word: string,
      language: string,
      includeRelated: Related[]
    ): Result;
  }

  /**
   * A look up error.
   */
  export interface Error {
    originalError?: any;
    message?: string;
    type: ErrorType;
  }
}
