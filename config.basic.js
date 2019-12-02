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

// This config will go through all web pages on https://www.example.com and save one object
// per page containing the title along with an objectID equal to the value of the meta tag "pageID".
module.exports = {
  appId: '',
  apiKey: '',
  rateLimit: 2,
  schedule: 'at 12:00 am',
  startUrls: ['http://www.example.com'],
  actions: [
    {
      indexName: 'crawler-example',
      pathsToMatch: ['http://www.example.com/**'],
      recordExtractor: ({ $ }) => {
        const objectID = $('meta[name="pageID"]').attr('content');
        const title = $('title').text();

        return [
          {
            objectID,
            title,
          },
        ];
      },
    },
  ],
};
