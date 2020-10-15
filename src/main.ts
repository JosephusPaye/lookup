import cheerio from 'cheerio';
import { get } from 'httpie';

import { Lookup } from './types';
import { wordWebOnline } from './adapters/wordwebonline';

export { Lookup };

const adapters = new Map<Lookup.Source, Lookup.SourceAdapter>();
adapters.set('wordWebOnline', wordWebOnline);

export function error(
  type: Lookup.ErrorType,
  message?: string,
  originalError?: any
): Lookup.Error {
  const err = new Error(message);
  (err as any).type = type;
  (err as any).originalError = originalError;
  return (err as unknown) as Lookup.Error;
}

export async function lookUp(
  word: string,
  language: string,
  options: {
    source?: Lookup.Source;
    includeRelated?: Lookup.Related[];
  } = {}
) {
  const { source, includeRelated } = Object.assign(
    {},
    { source: 'wordWebOnline', includeRelated: ['antonyms'] },
    options
  );

  word = word.trim();
  if (word.length === 0) {
    throw error(Lookup.ErrorType.WORD_EMPTY, 'the given word is empty');
  }

  const sourceAdapter = adapters.get(source);

  if (!sourceAdapter) {
    throw error(
      Lookup.ErrorType.UNKNOWN_SOURCE,
      'the given source was not found'
    );
  }

  const url = sourceAdapter.url(word, language);
  const html = await fetchHtml(url, sourceAdapter);

  if (!sourceAdapter.validate(html, word, language)) {
    throw error(
      Lookup.ErrorType.NOT_FOUND,
      "fetched source HTML page doesn't match expected, perhaps the source format has changed"
    );
  }

  const $html = cheerio.load(html);

  try {
    return sourceAdapter.parse($html, word, language, includeRelated);
  } catch (err) {
    throw error(
      Lookup.ErrorType.EXTRACTION_FAILED,
      'unable to extract definitions from the source page',
      err
    );
  }
}

async function fetchHtml(url: string, adapter: Lookup.SourceAdapter) {
  try {
    if (adapter.fetch) {
      const html = await adapter.fetch(url);
      return html.trim();
    } else {
      const { data } = await get(url, {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
        },
      });
      return data.trim();
    }
  } catch (err) {
    throw error(
      Lookup.ErrorType.SOURCE_REQUEST_FAILED,
      'failed to fetch HTML page from source',
      err
    );
  }
}
