// This config represent everything (almost) that is possible with the crawler
module.exports = {
  appId: '',
  apiKey: '',
  rateLimit: 2,
  recrawlAfter: 300,
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
    useCookies: true,
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
        const records = [];

        const title = $('h1').text();
        const description = $('meta[name="description"]').attr('content');

        const createRecord = props => {
          records.push({
            title,
            description,
            path: url.pathname.split('/'),
            ...props,
          });
        };

        $('p').forEach(i => {
          createRecord({
            objectID: `${url.pathname}-paragraph#${i + 1}`,
            text: $(this).text(),
          });
        });

        return records;
      },
    },
  ],
};
