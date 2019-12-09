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

// This config can split long content into more than 1 record per resource.
module.exports = {
  actions: [
    {
      recordExtractor: ({ $, url }) => {
        // Settings and other constants

        const MAX_RECORD_LENGTH = 10000; // expressed in number of utf-8 characters
        const TEXT_ELEMENTS = ['p', 'li'];
        const WORD_SEPARATOR = ' '; // character to separate words in records

        // Helpers

        const turnEmptyTagsAsSpaces = $elem =>
          $elem.children().each((i, child) => {
            if (!$(child).text()) $(child).text(WORD_SEPARATOR);
          });

        const recordsAccu = new (class RecordsAccumulator {
          records = [];
          add(...records) {
            this.records.push(...records);
          }
          getNextIndex() {
            return this.records.length;
          }
          getAll() {
            return this.records;
          }
        })();

        const pageParser = new (class PageParser {
          getMeta = () => ({
            title: $('h1').text(),
            description: $('meta[name="description"]').attr('content'),
          });
          forEachTextElement(fct) {
            $(TEXT_ELEMENTS.join(', ')).each((i, elem) => {
              const $elem = $(elem);
              turnEmptyTagsAsSpaces($elem);
              // de-duplicate whitespace (i.e. space or line break) into word separators
              const text = $elem
                .text()
                .trim()
                .replace(/\s+/g, WORD_SEPARATOR);
              fct(text);
            });
          }
        })();

        const pageIndexer = new (class PageIndexer {
          pageMeta = pageParser.getMeta();
          createRecord = ({ text, part }) => ({
            objectID: `${url.pathname} ${part}`,
            path: url.pathname.split('/'),
            ...this.pageMeta,
            text: text || '',
          });
        })();

        const splitToFitRecord = (text, baseRecord) => {
          const availableLength =
            MAX_RECORD_LENGTH - JSON.stringify(baseRecord).length;
          // split the content between two words, unless the rest fits in a record
          const splitPos =
            text.length <= availableLength
              ? availableLength
              : text.lastIndexOf(WORD_SEPARATOR, availableLength) + 1;
          return {
            text: text.substr(0, splitPos).trim(),
            rest: text.substr(splitPos),
          };
        };

        // Content extraction and splitting logic

        pageParser.forEachTextElement(textToIndex => {
          while (textToIndex) {
            const baseRecord = pageIndexer.createRecord({
              part: recordsAccu.getNextIndex(),
            });
            const { text, rest } = splitToFitRecord(textToIndex, baseRecord);
            recordsAccu.add({ ...baseRecord, text });
            textToIndex = rest;
          }
        });

        return recordsAccu.getAll();
      },
    },
  ],
};
