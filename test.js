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

  it(`matches phrase from unique paragraph`, () => {
    const paragPhrase = 'Hello World!';
    const records = recordExtractor({
      html: `<html><body><p>${paragPhrase}</p></body></html>`,
    });
    it.eq(
      records.some(({ text }) => text.includes(paragPhrase)),
      true
    );
  });

  it(`matches phrase from second paragraph`, () => {
    const paragPhrase = 'Hello World!';
    const records = recordExtractor({
      html: `<html><body><p>parag1</p><p>${paragPhrase}</p></body></html>`,
    });
    it.eq(
      records.some(({ text }) => text.includes(paragPhrase)),
      true
    );
  });

  it(`matches phrase from list item`, () => {
    const paragPhrase = 'Hello World!';
    const records = recordExtractor({
      html: `<html><body><ul><li>${paragPhrase}</li></ul></body></html>`,
    });
    it.eq(
      records.some(({ text }) => text.includes(paragPhrase)),
      true
    );
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
