const { URL } = require('url');
const cheerio = require('cheerio');

const DEFAULT_START_URL = 'http://www.example.com/';

// necessary to turn inline tags (e.g. <br/>) into spaces
const addSeparatorsBetweenChildElements = ($elem, $) => {
  const $childNodes = $elem.children();
  if ($childNodes.length === 0) {
    $elem.text(($elem.text() || '') + ' ');
  } else {
    $childNodes.each(
      (i, child) => addSeparatorsBetweenChildElements($(child), $) // recurse through the DOM tree, depth first
    );
  }
};

// This is a simplified version of the helper exposed in the crawler
// (https://www.algolia.com/doc/tools/crawler/apis/configuration/actions/#parameter-param-helpers-2)
function splitContentIntoRecords({
  $,
  baseRecord,
  $elements = $('body'),
  maxRecordBytes = 1000,
  textAttributeName = 'text',
}) {
  const records = [];
  addSeparatorsBetweenChildElements($elements, $);
  $elements.each((_i, contentElem) => {
    const baseRecordBytes = Buffer.from(JSON.stringify(baseRecord)).length;
    const availableBytesPerRecord = maxRecordBytes - baseRecordBytes;
    const $contentElem = $(contentElem);
    // Clean whitespaces
    let remainingText = $contentElem.text().replace(/\s+/gm, ' ').trim();
    while (remainingText) {
      const splitPos = remainingText.length < availableBytesPerRecord ?
        availableBytesPerRecord :
        remainingText.lastIndexOf(' ', availableBytesPerRecord) + 1;
      const text = remainingText.slice(0, splitPos);
      records.push({
        ...baseRecord,
        [textAttributeName]: text,
      });
      remainingText = remainingText.slice(splitPos);
    }
  });
  return records;
}

function loadRecordExtractor(configFile) {
  const { startUrls, actions } = require(`./${configFile}`);
  const { recordExtractor } = actions[0];
  const defaultUrl = new URL((startUrls || [DEFAULT_START_URL])[0]);
  return ({ url = defaultUrl, title = 'Some page', html = '' }) => {
    const $ = cheerio.load(html);
    return recordExtractor({
      url,
      title,
      $,
      helpers: {
        splitContentIntoRecords: ({baseRecord, $elements, maxRecordBytes, textAttributeName}) => {
          return splitContentIntoRecords({$, baseRecord, $elements, maxRecordBytes, textAttributeName});
        }
      }
    });
  }
}

exports.loadRecordExtractor = loadRecordExtractor;
exports.addSeparatorsBetweenChildElements = addSeparatorsBetweenChildElements;
