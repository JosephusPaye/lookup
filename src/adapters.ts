import { Lookup } from './types';

/**
 * An adapter that provides definitions and synonyms from an online source
 */
export interface SourceAdapter {
  /**
   * Get attribution for the source, for user-level display.
   */
  attribution(): string;

  /**
   * Create a URL to look up definitions of the given word from the source.
   */
  url(word: string, language: string, type: Lookup.Type): string;

  /**
   * Verify that the HTML page fetched from the source is as expected.
   * Recommended to look for a unique value in the HTML that indicates
   * a valid definition was returned on the page.
   */
  validateSourceResponse(
    html: string,
    word: string,
    language: string,
    type: Lookup.Type
  ): boolean;

  /**
   * Parse the source HTML page to extract definitions using cheerio.
   */
  getDefinitions(
    $html: cheerio.Root,
    word: string,
    language: string,
    includeRelated: Lookup.Related[]
  ): Lookup.DefinitionsResult;

  /**
   * Parse the source HTML page to extract synonyms using cheerio.
   */
  getSynonyms(
    $html: cheerio.Root,
    word: string,
    language: string
  ): Lookup.SynonymsResult;
}
