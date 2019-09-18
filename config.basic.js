// This config will  go through all web pages on https://www.example.com and save one object
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
