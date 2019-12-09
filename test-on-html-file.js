const fs = require('fs');
const { URL } = require('url');
const cheerio = require('cheerio');
const junit = require('junit');

const USAGE =
  '$ node test-on-html-file.js <name_of_page.html> [<name_of_config.js>]';

const DEFAULT_CONFIG_FILE = 'config.splitting.js';

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

function test(recordExtractor, htmlFile) {
  const it = junit();

  it.describe(htmlFile, it => {
    const html = fs.readFileSync(htmlFile);
    const records = recordExtractor({ html });
    console.warn('ℹ number of records read from HTML file:', records.length);

    const words = [];
    const $ = cheerio.load(html);
    $('p, li').each((i, elem) =>
      words.push(
        ...$(elem)
          .text()
          .split(' ')
      )
    );

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
          if (!found) console.warn(`⚠ missing from records: "${word}"`);
          return !found;
        }),
        false
      ));
  });

  return it.run();
}

// start of actual script

const htmlFile = process.argv[2];
const configFile = process.argv[3] || DEFAULT_CONFIG_FILE;

if (!configFile) {
  console.error(`usage: ${USAGE}`);
  process.exit(1);
}

test(loadRecordExtractor(configFile), htmlFile);
