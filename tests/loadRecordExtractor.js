const { URL } = require('url');
const cheerio = require('cheerio');

const DEFAULT_START_URL = 'http://www.example.com/';

function loadRecordExtractor(configFile) {
  const { startUrls, actions } = require(`./../${configFile}`);
  const { recordExtractor } = actions[0];
  const defaultUrl = new URL((startUrls || [DEFAULT_START_URL])[0]);
  return ({ url = defaultUrl, title = 'Some page', html = '' }) =>
    recordExtractor({
      url,
      title,
      $: cheerio.load(html),
    });
}

exports.loadRecordExtractor = loadRecordExtractor;
