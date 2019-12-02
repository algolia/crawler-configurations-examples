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

module.exports = {
  appId: 'YOUR_APP_ID',
  apiKey: 'YOUR_API_KEY',
  rateLimit: 2,
  schedule: 'every 1 day',
  startUrls: ['http://www.example.com'],
  externalDataSources: [
    {
      dataSourceId: 'myPageviews',
      type: 'csv',
      url: 'http://www.example.com/pageviews.csv',
    },
    {
      dataSourceId: 'myCSV',
      type: 'csv',
      url: 'http://www.example.com/website-data.csv',
    },
  ],
  actions: [
    {
      indexName: 'mysite.index1',
      pathsToMatch: ['http://www.example.com/index.html'],
      recordExtractor: ({ url, dataSources }) => [
        {
          objectID: url.href,
          pageviews: dataSources.myPageviews.pageviews,
          // if no external data were found for 'myCSV' dataSource for the current URL, dataSources.myCSV will be empty,
          // i.e. 'category' will be undefined and thus simply not saved in the final record
          category: dataSources.myCSV.category,
          // There is no boolean type in CSV, so here we convert the string "true" into a boolean
          onsale: dataSources.myCSV.onsale === 'true',
        },
      ],
    },
  ],
};
