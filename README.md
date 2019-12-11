# crawler-configurations-examples

This repository contains sample configuration files for [Algolia Crawler](https://www.algolia.com/products/crawler/):

- [`config.basic.js`](./config.basic.js) will go through all web pages on https://www.example.com and save one object per page containing the `title` along with an `objectID` equal to the value of the meta tag `pageID`.
- [`config.documents.js`](./config.documents.js) adopts a different record extraction strategy, depending on the type of resource being crawled: HTML page or PDF/DOC document.
- [`config.advanced.js`](./config.advanced.js) showcases several advanced features: authorization, setting up a session cookie, scheduling, ignoring query params and backup.
- [`config.csv.js`](./config.csv.js) shows how to integrate pageviews and categories from external CSV files.
- [`config.google-analytics.js`](./config.google-analytics.js) shows how to integrate pageviews from Google Analytics.
- [`config.splitting.js`](./config.splitting.js) implements full-text search while complying with the record size limits of your Algolia plan, by splitting the textual content to fill records.

## License

Apache 2.0 - See [LICENSE](/LICENSE) for more information.
