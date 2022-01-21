# RTF (Relative Time Format)

Easily convert any date to a relative time string (e.g., "yesterday", "last week", "2 years ago"), with translations
for internationalization (i18n) and localization (l10n).

## Key Features

* Uses native JavaScript [Intl.RelativeTimeFormat] under the hood, with no dependencies.
* Formats any Date object, timestamp, or valid string representation of a date that can be parsed by [Date.parse()].
* Provides HTTP middleware compatible with popular REST frameworks like [Express] and i18n tools like [i18next].

### Why use this instead of Intl.RelativeTimeFormat.prototype.format()?

The API for [Intl.RelativeTimeFormat.prototype.format()] takes two arguments: value and units.

```javascript
const rtf = new Intl.RelativeTimeFormat("en", { style: "narrow" });

expect(rtf.format(-1, "day")).toBe("1 day ago");
expect(rtf.format(10, "seconds")).toBe("in 10 sec.");
```

In order to convert a [Date] object, timestamp, or date string, you need to write a bunch of boilerplate. This library
saves you that headache, and can also be used to generate a middleware function for your REST API that works with your
i18n library.

## Installation

```shell
yarn add @sscovil/rtf
# OR
npm install @sscovil/rtf
```

## Usage

Format a [Date] object:

```javascript
import RTF from "@sscovil/rtf";

const rtf = new RTF();
const date = new Date();
expect(rtf.format(date)).toBe("now");

const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);
expect(rtf.format(yesterday)).toBe("yesterday");

const tomorrow = new Date(date.getTime() + 24 * 60 * 61 * 1000);
expect(rtf.format(tomorrow)).toBe("tomorrow");
```

Format a numeric timestamp:

```javascript
import RTF from "@sscovil/rtf";

const rtf = new RTF();
const date = Date.now();
expect(rtf.format(date)).toBe("now");
```

Format a date string:

```javascript
import RTF from "@sscovil/rtf";

const rtf = new RTF();
const date = new Date().toUTCString();
expect(rtf.format(date)).toBe("now");
```

Format in another language:

```javascript
import RTF from "@sscovil/rtf";

const rtf = new RTF();
const minutesAgo = Date.now() - 30 * 60 * 1000;
expect(rtf.format(minutesAgo, "en")).toBe("30 minutes ago");
expect(rtf.format(minutesAgo, "es")).toBe("hace 30 minutos");
expect(rtf.format(minutesAgo, "ja")).toBe("30 分前");
expect(rtf.format(minutesAgo, "ru")).toBe("30 минут назад");
expect(rtf.format(minutesAgo, "zh")).toBe("30分钟前");
```

Use different [Intl.RelativeTimeFormat] options:

```javascript
import RTF from "@sscovil/rtf";

const rtf = new RTF({
    localeMatcher: RTF.opt.localeMatcher.lookup,
    numeric: RTF.opt.numeric.always,
    style: RTF.opt.style.short
});
const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
expect(rtf.format(weekAgo)).toBe("1 wk. ago");
```

Use as [Express] middleware in conjunction with [i18next]:

```javascript
import express from "express";
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import RTF from "@sscovil/rtf";

const app = express();

i18next.use(i18nextMiddleware.LanguageDetector).init({ /* i18next config */ });
app.use(i18nextMiddleware.handle(i18next));
app.use(RTF.httpMiddleware()); // with default configuration

app.get("/", (req, res) => {
    const minutesAgo = Date.now() - 30 * 60 * 1000;
    expect(req.language).toBe("en"); // or whatever language was detected by i18nextMiddleware.LanguageDetector
    expect(req.rtf(minutesAgo)).toBe("30 minutes ago"); // by default, req.rtf function uses req.language for locale
});
```

Use as [Express] middleware with another i18n language detector:

```javascript
import express from "express";
import RTF from "@sscovil/rtf";

const app = express();

app.use((req, res, next) => {
    req.locale = req.query.lng; // basic i18n middleware to detect language from a query parameter, for example
    next();
});

const rtf = new RTF({ style: RTF.opt.style.short });

app.use(RTF.httpMiddleware(rtf, "rtFormat", "locale")); // with custom configuration

app.get("/", (req, res) => {
    const minutesAgo = Date.now() - 30 * 60 * 1000;
    expect(req.locale).toBe("en"); // or whatever language was detected by the custom i18n middleware defined above
    expect(req.rtFormat(minutesAgo)).toBe("30 min. ago"); // req.rtFormat function uses req.locale, based on config
});
```

## Running Tests

```shell
yarn run test
# OR
npm test
```

[Date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[Date.parse()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
[Express]: https://expressjs.com/en/guide/writing-middleware.html
[i18next]: https://www.npmjs.com/package/i18next-http-middleware
[IANA language subtag]: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
[Intl.RelativeTimeFormat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat
[Intl.RelativeTimeFormat.prototype.format()]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/format