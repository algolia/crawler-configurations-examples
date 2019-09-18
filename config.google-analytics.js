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
