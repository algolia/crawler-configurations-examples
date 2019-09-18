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
