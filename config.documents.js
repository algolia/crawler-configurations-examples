/*
 * Copyright 2019-2021 Algolia Inc. All rights reserved.
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

// This config will index
// -  html / pdf / doc
//
// Extractors
// the 1st: will get all paragraph no matter the type of file (html, pdf, doc)
// the 2nd: will parse only html
// the 3rd: will parse only pdf and doc
module.exports = {
  appId: '',
  apiKey: '',
  rateLimit: 2,
  actions: [
    {
      // Extract all paragraphs from the pages in separate records
      indexName: 'crawler-example',
      pathsToMatch: ['https://www.example.com/**'],
      fileTypesToMatch: ['html', 'pdf', 'doc'],
      recordExtractor: ({ url, $, fileType }) => {
        return $('p')
          .map((_i, el) =>
            $(el)
              .text()
              .trim()
          )
          .get()
          .filter(paragraph => Boolean(paragraph))
          .map((paragraph, i) => ({
            objectID: `${url.href}#${i}`,
            url: url.href,
            fileType,
            paragraph,
          }));
      },
    },
    {
      // For HTML pages, take the <title> tag as title
      indexName: 'crawler-example',
      pathsToMatch: ['https://www.example.com/**'],
      recordExtractor: ({ url, $, fileType }) => {
        return [
          {
            objectID: url.href,
            url: url.href,
            fileType,
            title: $('head > title').text(),
          },
        ];
      },
    },
    {
      // For documents, take the first paragraph as title
      indexName: 'crawler-example',
      pathsToMatch: ['https://www.example.com/**'],
      fileTypesToMatch: ['pdf', 'doc'],
      recordExtractor: ({ url, $, fileType }) => {
        return [
          {
            objectID: url.href,
            url: url.href,
            fileType,
            title: $('p')
              .map((_i, el) =>
                $(el)
                  .text()
                  .trim()
              )
              .get()
              .find(paragraph => Boolean(paragraph)),
          },
        ];
      },
    },
  ],
};
