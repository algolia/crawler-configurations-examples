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

// This config will index html pages with google analytics data.
/* eslint-disable camelcase */
module.exports = {
  appId: '',
  apiKey: '',
  notifySlackHandle: '@mySlackUsername',
  rateLimit: 2,
  schedule: 'at 3:00 pm',
  startUrls: ['http://www.example.com'],
  externalDataSources: [
    {
      dataSourceId: 'myAnalytics',
      type: 'googleanalytics',
      metrics: ['ga:uniquePageViews'],
      startDate: '90daysAgo',
      endDate: 'today',
      credentials: {
        type: 'service_account',
        client_email: 'dummy@my-project.iam.gserviceaccount.com',
        private_key:
          '-----BEGIN PRIVATE KEY-----\nMIIEvQIB...gQsy39U=\n-----END PRIVATE KEY-----\n',
        viewIds: [173463077],
      },
    },
  ],
  actions: [
    {
      indexName: 'crawler-example',
      pathsToMatch: ['http://www.example.com/**'],
      recordExtractor: ({ url, dataSources }) => {
        const pageviews = dataSources.myAnalytics['ga:uniquePageViews'];
        const bucket = Math.floor(Math.log(pageviews));

        return [
          {
            objectID: url.href,
            path: url.pathname.split('/'),
            stats: {
              pageviews,
              bucket,
              isTopBucket: bucket >= 12,
            },
          },
        ];
      },
    },
  ],
};
