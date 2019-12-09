const junit = require('junit');
const { loadRecordExtractor } = require('./loadRecordExtractor');

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

  it.describe('paragraph with words separated by an element', it => {
    const words = 'Hello World!'.split(' ');
    const records = recordExtractor({
      html: `<html><body><p>${words.join('<br/>')}</p></body></html>`,
    });

    it(`matches the first word`, () =>
      it.eq(
        records.some(({ text }) => text.includes(words[0])),
        true
      ));

    it(`matches the second word`, () =>
      it.eq(
        records.some(({ text }) => text.includes(words[1])),
        true
      ));

    it(`does not match the concatenation of words`, () =>
      it.eq(
        records.some(({ text }) => text.includes(words[0] + words[1])),
        false
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

  it.describe('page with a nested link', it => {
    const records = recordExtractor({
      html: `<html><body><p>one <a href="">two</a> <ul><li>three</li></ul></p></body></html>`,
    });

    it(`matches title of <a> link`, () =>
      it.eq(
        records.some(({ text }) => text.includes('two')),
        true
      ));

    it(`matches content of nested <li>`, () =>
      it.eq(
        records.some(({ text }) => text.includes('three')),
        true
      ));
  });

  it.describe('page with extra whitespace', it => {
    const records = recordExtractor({
      html: `<html><body><p>  one\ntwo \r\nthree</p></body></html>`,
    });

    it(`indexes one record`, () => it.eq(records.length, 1));

    it(`indexes words without extra whitespace`, () =>
      it.eq(records[0].text, 'one two three'));
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
