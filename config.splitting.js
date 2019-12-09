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

// This config represent everything (almost) that is possible with the crawler
module.exports = {
  appId: '',
  apiKey: '',
  rateLimit: 2,
  schedule: 'at 3:00 pm',
  saveBackup: true,
  startUrls: ['http://www.example.com'],
  exclusionPatterns: ['http://www.example.com/junk/**'],
  ignoreQueryParams: ['ref'],
  requestOptions: {
    proxy: 'http://login:pwd@221.221.221.221:3219',
    headers: {
      Authorization: 'basic dGVzdDpjcmVkZW50aWFscw==',
    },
  },
  login: {
    fetchRequest: {
      url: `http://example.com/secure/login-with-post`,
      retries: 3,
      requestOptions: {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'id=my-id&password=my-password',
        followRedirect: false,
        timeout: 5000, // in milliseconds
      },
    },
  },
  actions: [
    {
      indexName: 'crawler-example',
      pathsToMatch: ['http://www.example.com/**'],
      recordExtractor: ({ $, url }) => {
        const MAX_RECORD_LENGTH = 10000; // expressed in number of utf-8 characters
        const records = [];

        const title = $('h1').text();
        const description = $('meta[name="description"]').attr('content');

        const createRecord = ({ text, part }) => ({
          objectID: `${url.pathname} ${part}`,
          path: url.pathname.split('/'),
          title,
          description,
          text: text || '',
        });

        const textTags = ['p', 'li'];
        const matchesTags = (elem, tags) =>
          elem.name.match(new RegExp(textTags.join('|'), 'i'));
        const turnOtherTagsAsSpaces = elem =>
          $(elem)
            .children()
            .each((i2, child) => {
              if (!matchesTags(child, textTags)) $(child).text(' ');
            });

        $(textTags.join(', ')).each((i, elem) => {
          turnOtherTagsAsSpaces(elem);
          // split long content into several records
          let textToIndex = $(elem)
            .text()
            .trim();
          while (textToIndex) {
            const record = createRecord({
              part: records.length,
            });
            const remainingLength =
              MAX_RECORD_LENGTH - JSON.stringify(record).length;
            // split the content between two words, unless the rest fits in a record
            const splitPos =
              textToIndex.length <= remainingLength
                ? remainingLength
                : textToIndex.lastIndexOf(' ', remainingLength) + 1;
            records.push({
              ...record,
              text: textToIndex.substr(0, splitPos).trim(),
            });
            textToIndex = textToIndex.substr(splitPos);
          }
        });

        return records;
      },
    },
  ],
};
