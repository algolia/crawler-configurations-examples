/*
 * Copyright 2019 Algolia Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This config can split long content into more than 1 record per resource, by:
//
// 1. extracting the text from a given list of elements; (see TEXT_ELEMENTS)
// 2. and, if needed, splitting the textual content of each matching element
//    into more than one record, depending on the maximum record size allowed
//    by your Algolia plan. (see MAX_RECORD_LENGTH)
//
// In order to make sure that every word of that content can be used to match
// the page, the splitting will happen between words, and whitespace (including
// line breaks) will be de-duplicated into single spaces. (see WORD_SEPARATOR)
//
// Feel free to change the page metadata (`pageMeta`) that will be included in
// all resulting records, based on your needs.
//
module.exports = {
  actions: [
    {
      recordExtractor: ({ $, url }) => {
        // Settings and other constants

        const MAX_RECORD_LENGTH = 10000; // expressed in number of utf-8 characters
        const TEXT_ELEMENTS = ['body']; // selectors of elements to be indexed as Algolia records
        const WORD_SEPARATOR = ' '; // character to separate words in records

        // Page metadata

        const pageMeta = {
          path: url.pathname.split('/'),
          title: $('title').text(),
          description: $('meta[name="description"]').attr('content'),
        };

        // Content Extraction helpers

        const addSeparatorsBetweenChildElements = $elem => {
          const $childNodes = $elem.children();
          if ($childNodes.length === 0) {
            $elem.text(($elem.text() || '') + WORD_SEPARATOR);
          } else {
            $childNodes.each(
              (i, child) => addSeparatorsBetweenChildElements($(child)) // recurse through the DOM tree, depth first
            );
          }
        };

        const forEachTextElement = fct =>
          $(TEXT_ELEMENTS.join(', ')).each((i, elem) => {
            const $elem = $(elem);
            addSeparatorsBetweenChildElements($elem);
            fct({
              text: $elem
                .text()
                .trim()
                .replace(/\s+/g, WORD_SEPARATOR), // de-duplicate whitespace (i.e. space or line break) into word separators
            });
          });

        // Indexing helpers

        const createRecord = ({ text = '', part }) => ({
          objectID: `${url.pathname} ${part}`,
          ...pageMeta,
          text,
        });

        const serializeString = str => JSON.stringify(str).slice(1, -1); // remove surrounding quotes

        const deserializeString = str => JSON.parse(`"${str}"`); // re-add surrounding quotes

        const splitToFitRecord = (text, baseRecord) => {
          const availableLength =
            MAX_RECORD_LENGTH - JSON.stringify(baseRecord).length;
          const serializedText = serializeString(text); // needed to estimate the weight of that string, as it's gonna be stored in the Algolia record
          // split the content between two words, unless the rest fits in a record
          const splitPos =
            serializedText.length <= availableLength
              ? availableLength
              : serializedText.lastIndexOf(WORD_SEPARATOR, availableLength) + 1;
          return {
            text: deserializeString(serializedText.substr(0, splitPos)).trim(),
            rest: deserializeString(serializedText.substr(splitPos)),
          };
        };

        // Content extraction and splitting logic

        const records = [];

        forEachTextElement(({ text: textToIndex }) => {
          while (textToIndex) {
            const baseRecord = createRecord({
              part: records.length, // the index of the next item will be used in the objectID
            });
            const { text, rest } = splitToFitRecord(textToIndex, baseRecord);
            records.push({ ...baseRecord, text });
            textToIndex = rest;
          }
        });

        return records;
      },
    },
  ],
};
