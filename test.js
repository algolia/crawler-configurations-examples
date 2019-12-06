const { URL } = require('url');
const cheerio = require('cheerio');
const junit = require('junit');

function loadRecordExtractor(configFile) {
  const { startUrls, actions } = require(`./${configFile}`);
  const { recordExtractor } = actions[0];
  return ({ url = new URL(startUrls[0]), title = 'Some page', html = '' }) =>
    recordExtractor({
      url,
      title,
      $: cheerio.load(html),
    });
}

function test(recordExtractor) {
  const it = junit();

  it.describe('page with 2 small paragraphs', it => {
    const phrase1 = 'phrase1';
    const phrase2 = 'phrase2';
    const records = recordExtractor({
      html: `<html><body><p>${phrase1}</p><p>${phrase2}</p></body></html>`,
    });

    it(`matches phrase from unique paragraph`, () =>
      it.eq(
        records.some(({ text }) => text.includes(phrase1)),
        true
      ));

    it(`matches phrase from second paragraph`, () =>
      it.eq(
        records.some(({ text }) => text.includes(phrase2)),
        true
      ));
  });

  it.describe('page with list', it => {
    const phrase = 'Hello World!';
    const records = recordExtractor({
      html: `<html><body><ul><li>${phrase}</li></ul></body></html>`,
    });

    it(`matches phrase from list item`, () =>
      it.eq(
        records.some(({ text }) => text.includes(phrase)),
        true
      ));
  });

  it.describe('page with 1 big paragraph', it => {
    const words = Array.from({ length: 9000 }, (...k) => `word${k}`);
    const records = recordExtractor({
      html: `<html><body><p>${words.join(' ')}</p></body></html>`,
    });

    it(`matches first word`, () =>
      it.eq(
        records.some(({ text }) => text.includes(words[0])),
        true
      ));

    it(`matches last word`, () =>
      it.eq(
        records.some(({ text }) => text.includes(words[words.length - 1])),
        true
      ));

    it(`fits 10KB per record`, () =>
      it.eq(
        records.some(record => JSON.stringify(record).length > 10000),
        false
      ));
    
    it(`matches all words`, () =>
      it.eq(
        words.some(word => {
          const found = records.some(({ text }) => text.includes(word));
          if (!found) console.warn(`⚠ "${word}" was not found in records`);
          return !found;
        }),
        false
      ));
  });

  return it.run();
}

// start of actual script

const configFile = process.argv[2];

if (!configFile) {
  console.error('usage: $ npm test <name_of_config.js>');
  process.exit(1);
}

test(loadRecordExtractor(configFile));
