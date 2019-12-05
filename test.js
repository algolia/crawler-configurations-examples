const { URL } = require('url');
const cheerio = require('cheerio');

const configFile = process.argv[2];

if (!configFile) {
  console.error('usage: $ npm test <name_of_config.js>');
  process.exit(1);
}

const { startUrls, actions } = require(`./${configFile}`);

const { recordExtractor } = actions[0];

const records = recordExtractor({
  url: new URL(startUrls[0]),
  title: 'Some page',
  $: cheerio.load('<html><body><p>Hello World!</p></body></html>'),
});

console.log('=>', { records });
