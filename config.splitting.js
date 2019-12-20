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
//    by your Algolia plan. (see the `maxRecordBytes` property)
//
// In order to make sure that every word of that content can be used to match
// the page, the splitting will happen between words, and whitespace (including
// line breaks) will be de-duplicated into single spaces.
//
// Feel free to change the page metadata (`baseRecord`) that will be included in
// all resulting records, based on your needs.
//
module.exports = {
  actions: [
    {
      recordExtractor: ({ $, url }) => {

        const TEXT_ELEMENTS = ['body']; // selectors of elements to be indexed as Algolia records
        // 👆 Here we are taking the whole document, but you could use any other
        // selector that will split your content, like 'p', 'i', or even '.page'
        // if your document has some pages sections.

        const baseRecord = {
          // URL
          url: url.href,
          hostname: url.hostname,
          path: url.pathname.split('/'),
          depth: url.pathname.split("/").length - 1,
          // Metadata
          title: $("head title").text().trim(),
          keywords: $("meta[name=keywords]").attr("content"),
          description: $("meta[name=description]").attr("content"),
        };
        
        const records = helpers.splitContentIntoRecords({
          baseRecord,
          $elements: $(TEXT_ELEMENTS.join(', ')),
          maxRecordBytes: 10000,
          textAttributeName = 'text',
          orderingAttributeName = 'part',
        });
        // (documentation: https://algolia.com/doc/api-reference/crawler/configuration/actions/#parameter-param-splitcontentintorecords)

        // You can still alter produced records
        // afterwards, if needed.
        return records;
      },
    },
  ],
};
