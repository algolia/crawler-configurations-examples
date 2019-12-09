# crawler-configurations-examples

This repository contains:

- sample configuration files for [Algolia Crawler](https://www.algolia.com/products/crawler/);
- and a configuration tester.

## How to test a configuration

Make sure you have Node.js installed, then run the following commands:

```sh
$ cd tests
$ npm install
$ npm test ../config.splitting.js
$ npm run test:html # to test config.splitting.js against real HTML files
```

## License

Apache 2.0 - See [LICENSE](/LICENSE) for more information.
