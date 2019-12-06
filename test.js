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

  it.describe('page with 2 small paragraphs', it => {
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

  return it.run();
}

// start of actual script

const configFile = process.argv[2];

if (!configFile) {
  console.error('usage: $ npm test <name_of_config.js>');
  process.exit(1);
}

test(loadRecordExtractor(configFile));
