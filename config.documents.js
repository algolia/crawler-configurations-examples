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
      // Extract all paragraphs from the pages
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
          .map(paragraph => ({
            objectID: url.href,
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
              .filter(paragraph => Boolean(paragraph)),
          },
        ];
      },
    },
  ],
};
