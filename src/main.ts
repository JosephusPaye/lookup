import cheerio from 'cheerio';
import { get } from 'httpie';

import { Lookup } from './types';
import { SourceAdapter } from './adapters';
import { wordWebOnline } from './adapters/wordwebonline';

export { Lookup };

/**
 * Look up definitions and words related to the given word.
 */
export async function definitions(
  word: string,
  options: {
    language?: Lookup.Language;
    source?: Lookup.Source;
    includeRelated?: Lookup.Related[];
  } = {}
): Promise<Lookup.DefinitionsResult> {
  const resolvedOptions = Object.assign(
    {},
    {
      language: 'en',
      source: 'wordWebOnline',
      includeRelated: ['antonyms'],
    },
    options
  );

  return lookup(word, {
    type: 'definitions',
    ...resolvedOptions,
  }) as Promise<Lookup.DefinitionsResult>;
}

/**
 * Look up synonyms of the given word.
 */
export async function synonyms(
  word: string,
  options: {
    language?: Lookup.Language;
    source?: Lookup.Source;
  } = {}
): Promise<Lookup.SynonymsResult> {
  const resolvedOptions = Object.assign(
    {},
    {
      language: 'en',
      source: 'wordWebOnline',
    },
    options
  );

  return lookup(word, {
    type: 'synonyms',
    ...resolvedOptions,
  }) as Promise<Lookup.SynonymsResult>;
}

const adapters = new Map<Lookup.Source, SourceAdapter>();
adapters.set('wordWebOnline', wordWebOnline);

async function lookup(
  word: string,
  options:
    | {
        type: 'definitions';
        language: Lookup.Language;
        source: Lookup.Source;
        includeRelated: Lookup.Related[];
      }
    | {
        type: 'synonyms';
        language: Lookup.Language;
        source: Lookup.Source;
      }
) {
  word = word.trim();

  if (word.length === 0) {
    throw error(Lookup.ErrorType.WORD_EMPTY, 'the given word is empty');
  }

  const sourceAdapter = adapters.get(options.source);

  if (!sourceAdapter) {
    throw error(
      Lookup.ErrorType.UNKNOWN_SOURCE,
      'the given source was not found'
    );
  }

  const { language, type } = options;

  const url = sourceAdapter.url(word, language, type);
  const html = await fetchHtml(url);

  if (!sourceAdapter.validateSourceResponse(html, word, language, type)) {
    throw error(
      Lookup.ErrorType.NOT_FOUND,
      "fetched source HTML page doesn't match expected, perhaps the source format has changed"
    );
  }

  const $html = cheerio.load(html);

  try {
    return options.type === 'definitions'
      ? sourceAdapter.getDefinitions(
          $html,
          word,
          language,
          options.includeRelated
        )
      : sourceAdapter.getSynonyms($html, word, language);
  } catch (err) {
    throw error(
      Lookup.ErrorType.EXTRACTION_FAILED,
      'unable to extract definitions from the source page',
      err
    );
  }
}

async function fetchHtml(url: string) {
  try {
    const { data } = await get(url, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    });
    return data.trim();
  } catch (err) {
    throw error(
      Lookup.ErrorType.SOURCE_REQUEST_FAILED,
      'failed to fetch HTML page from source',
      err
    );
  }
}

function error(
  type: Lookup.ErrorType,
  message?: string,
  originalError?: any
): Lookup.Error {
  const err = new Error(message);
  (err as any).type = type;
  (err as any).originalError = originalError;
  return (err as unknown) as Lookup.Error;
}
