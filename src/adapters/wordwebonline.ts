import { SourceAdapter } from '../adapters';
import { Lookup } from '../types';

function attribution() {
  return 'Definitions from WordWeb Online';
}

export function url(word: string, language: string, type: Lookup.Type) {
  // WordWeb Online expects the word with no spaces or non-alphanumeric
  // characters, in uppercase. E.g. 'united states' => 'UNITEDSTATES',
  // 'e-mail' => 'EMAIL', 'U.S.A' => 'USA'
  const wordFormatted = word.replace(/[^\w\d]/g, '').toUpperCase();
  return `https://www.wordwebonline.com/${language.toLowerCase()}/${wordFormatted}`;
}

export function validateSourceResponse(
  html: string,
  word: string,
  language: string
) {
  // Validate that we're on a result page by checking that there's at least
  // one element with `CLASS="head"` (used at the beginning of meanings,
  // see `parseMeanings()` below for details)
  return html.indexOf('CLASS="head"') !== -1;
}

export function getDefinitions(
  $: cheerio.Root,
  word: string,
  language: string,
  includeRelated: Lookup.Related[]
): Lookup.DefinitionsResult {
  const meanings = parseMeanings($);

  const soundsLike = includeRelated.includes('soundsLike')
    ? parseRelated($, 'Sounds like:')
    : [];
  const derivedForms = includeRelated.includes('derivedForms')
    ? parseRelated($, 'Derived forms:', { isLinked: false })
    : [];
  const seeAlso = includeRelated.includes('seeAlso')
    ? parseRelated($, 'See also:')
    : [];
  const typeOf = includeRelated.includes('typeOf')
    ? parseRelated($, 'Type of:')
    : [];
  const partOf = includeRelated.includes('partOf')
    ? parseRelated($, 'Part of:')
    : [];
  const antonyms = includeRelated.includes('antonyms')
    ? parseRelated($, 'Antonym:')
    : [];

  const nearest = includeRelated.includes('nearest')
    ? parseNearest($)
    : { before: [], after: [] };

  return {
    attribution: attribution(),
    meanings,
    soundsLike,
    derivedForms,
    seeAlso,
    typeOf,
    partOf,
    antonyms,
    nearest,
  };
}

export function getSynonyms(
  $: cheerio.Root,
  word: string,
  language: string
): Lookup.SynonymsResult {
  const meanings = parseMeanings($);
  const synonyms: Lookup.Synonym[] = [];

  for (const meaning of meanings) {
    for (const definition of meaning.definitions) {
      for (const synonym of definition.synonyms) {
        synonyms.push({
          definition: definition.definition,
          partOfSpeech: meaning.partOfSpeech,
          synonym: synonym,
          word: meaning.word,
        });
      }
    }
  }

  return {
    attribution: attribution(),
    synonyms,
  };
}

function parseMeanings($: cheerio.Root): Lookup.Meaning[] {
  const meanings: Lookup.Meaning[] = [];

  // Each meaning (e.g. `Verb: rise (rose, risen) rIz [...]`)
  // begins with `<span class="head>Verb:</span>". This span
  // with the part of speech is what's called 'head'.
  const heads = $('#main-copy span.head').toArray();

  for (const head of heads) {
    // span.head: the part of speech (e.g. `<span class="head">Verb:</span>`)
    const partOfSpeech = $(head).text().trim().replace(':', '').toLowerCase();

    // span.key: the word (e.g. `<span class="key"> rise</span>`)
    const wordEl = $(head).next('.key');
    const word = wordEl.text().trim();

    // optional text node: the forms (e.g. ` (rose,risen)&nbsp;&nbsp;`)
    const nextToWord = wordEl[0].next;
    let forms: string[] = [];

    if (nextToWord.type === 'text') {
      const formsText = $(nextToWord).text().trim();

      if (formsText) {
        forms = formsText
          .replace('(', '')
          .replace(')', '')
          .split(',')
          .map((form) => form.trim());
      }
    }

    // optional span.pron: the pronunciation key (e.g. `<span class="pron" title="Key: /I/ eye">rIz</span>`)
    // find the nearest .pron without going past the next word (which is span.head)
    const pronunciationEl = $(head).nextUntil('.head').filter('.pron').first();
    const pronunciation =
      pronunciationEl.length > 0
        ? {
            text: pronunciationEl.text().trim(),
            key: pronunciationEl.attr('title')?.trim().replace('Key: ', ''),
          }
        : undefined;

    // <ol> with definitions
    const definitionsEl = $(head).nextUntil('.head').filter('ol').first();
    const definitions = parseDefinitions($, definitionsEl);

    // Add the found meaning
    meanings.push({
      word,
      partOfSpeech,
      forms,
      pronunciation,
      definitions,
    });
  }

  return meanings;
}

function parseDefinitions(
  $: cheerio.Root,
  olEl: cheerio.Cheerio
): Lookup.Definition[] {
  const definitions: Lookup.Definition[] = [];

  // Each definition is a <li> in the <ol>
  olEl.find('li').each(function (_, liEl) {
    // <li><span class="def">Move upward"</span> [...]</li>
    const definition = $(liEl).find('span.def').text().trim();

    // <li>[...]<span class="ex">The fog rose"</span> [...]</li>
    const exampleText = $(liEl).find('span.ex').text().trim();
    const examples = parseExamples(exampleText);

    const synonyms: string[] = [];

    // <li>[...]<a class="syn" [...]>lift</a>, <a class="syn" [...]>arise</a>, ... [...]</li>
    $(liEl)
      .find('a.syn')
      .each(function (_, aEl) {
        synonyms.push($(aEl).text().trim());
      });

    // Add the found definition
    definitions.push({
      definition,
      examples,
      synonyms,
    });
  });

  return definitions;
}

function parseRelated(
  $: cheerio.Root,
  label: string,
  { isLinked } = { isLinked: true }
) {
  let related: string[] = [];

  // <p class="rellnk"><span class="seealso">(some label) </span> [...]</p>
  const labelEl = $(`p.rellnk span:contains("${label}")`);

  if (!labelEl.length) {
    return [];
  }

  // Related terms are anchor tags with class "syn" in the p.rellnk element
  // <p class="rellnk">[...]<a class="syn" [...]>wr</a>, <a class="syn" [...]>ris</a>, []...]</p>
  if (isLinked) {
    $(labelEl.parent())
      .find('a.syn')
      .each(function (_, aEl) {
        related.push($(aEl).text().trim());
      });
  } else {
    related = $(labelEl[0].nextSibling)
      .text()
      .trim()
      .split(',')
      .map((related) => related.trim());
  }

  return related;
}

function parseNearest($: cheerio.Root): Lookup.DefinitionsResult['nearest'] {
  const nearest: Lookup.DefinitionsResult['nearest'] = {
    before: [],
    after: [],
  };

  let readingBefore = true;
  $('.rightSideBar .sideBarText a, .rightSideBar .sideBarText span').each(
    function (_, el) {
      // A <span> element holds the current term, so if we see it
      // then we've finished processing the terms before
      if (el.tagName === 'span') {
        readingBefore = false;
        return;
      }

      if (readingBefore) {
        nearest.before.push($(el).text().trim());
      } else {
        nearest.after.push($(el).text().trim());
      }
    }
  );

  return nearest;
}

// https://regexr.com/5e6ic
const examplesRegex = /"(.+?)";?/g;

function parseExamples(examplesText: string) {
  const examples: string[] = [];
  let match;

  do {
    match = examplesRegex.exec(examplesText);

    if (match) {
      examples.push(match[1]);
    }
  } while (match);

  return examples;
}

export const wordWebOnline: SourceAdapter = {
  url,
  validateSourceResponse,
  getDefinitions,
  getSynonyms,
  attribution,
};
