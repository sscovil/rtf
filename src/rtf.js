/**
 * Relative time formatter that leverages Intl.RelativeTimeFormat() under the hood. Provides a method to format a Date
 * object, timestamp, or any valid string representation of a date that can be parsed by Date.parse(). Also provides a
 * method for generating HTTP middleware that works with popular frameworks and i18n tools like Express and i18next.
 *
 * Documentation for Intl.RelativeTimeFormat() can be found here:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat/RelativeTimeFormat
 */
export default class RTF {
    formatters;
    options;

    /**
     * @param options {{localeMatcher: string?, numeric: string?, style: string?}} Intl.RelativeTimeFormat() options
     */
    constructor(options = RTF.defaultOptions) {
        this.options = options;
        this.formatters = { auto: new Intl.RelativeTimeFormat(undefined, this.options) };
    }

    /**
     * Add a formatter for a given locale.
     *
     * @param locale {string} A string with a BCP 47 language tag, or an array of such strings
     * @returns {boolean} True if locale is supported; otherwise false
     */
    addLocale(locale) {
        if (!Intl.RelativeTimeFormat.supportedLocalesOf(locale).includes(locale)) {
            return false;
        }
        if (!this.formatters.hasOwnProperty(locale)) {
            this.formatters[locale] = new Intl.RelativeTimeFormat(locale, this.options);
        }
        return true;
    }

    /**
     * Format a given date as a relative time string, with support for i18n.
     *
     * @param date {Date|number|string} Date object (or timestamp, or valid string representation of a date) to format
     * @param locale {string?} i18n code to use (e.g. 'en', 'fr', 'zh'); if omitted, default locale of runtime is used
     * @returns {string} Localized relative time string (e.g. '1 minute ago', '12 hours ago', '3 days ago')
     */
    format(date, locale = "auto") {
        if (!(date instanceof Date)) {
            date = new Date(Number.isNaN(date) ? Date.parse(date) : date);
        }
        if (!this.formatters.hasOwnProperty(locale) && !this.addLocale(locale)) {
            locale = "auto";
        }

        const elapsed = date - Date.now();

        for (let i = 0; i < RTF.units.length; i++) {
            const { unit, value } = RTF.units[i];
            if (unit === 'second' || Math.abs(elapsed) >= value) {
                return this.formatters[locale].format(Math.round(elapsed/value), unit);
            }
        }
    }

    /**
     * Generate HTTP middleware that works with popular frameworks and i18n tools like Express and i18next.
     *
     * @param rtf {RTF?} Instance of RTF to use; defaults to a new instance with default options
     * @param reqProp {string?} Property name to add to the HTTP request context; defaults to `rtf`
     * @param langProp {string?} Property of HTTP request context where language is stored; defaults to `language`
     * @returns {function(*, *, *): *} HTTP middleware function
     */
    static httpMiddleware(rtf = new RTF(), reqProp = "rtf", langProp = "language") {
        return (req, res, next) => {
            req[reqProp] = (date) => rtf.format(date, req[langProp]);
            next();
        };
    }

    /**
     * Default options object used by Intl.RelativeTimeFormat() constructor.
     *
     * @type {{localeMatcher: string, numeric: string, style: string}}
     */
    static defaultOptions = {
        localeMatcher: "best fit",
        numeric: "auto", // this intentionally differs from Intl.RelativeTimeFormat(), because "always" is dumb
        style: "long",
    };

    /**
     * Used to determine the arguments to pass to Intl.RelativeTimeFormat.prototype.format().
     */
    static units = [
        { unit: "year", value: 365 * 24 * 60 * 60 * 1000 },
        { unit: "month", value: 365 / 12 * 24 * 60 * 60 * 1000 },
        { unit: "week", value: 7 * 24 * 60 * 60 * 1000 },
        { unit: "day", value: 24 * 60 * 60 * 1000 },
        { unit: "hour", value: 60 * 60 * 1000 },
        { unit: "minute", value: 60 * 1000 },
        { unit: "second", value: 1000 },
    ];

    /**
     * Enumerated values for options object used by Intl.RelativeTimeFormat() constructor.
     *
     * @type {{localeMatcher: {lookup: string, default: string, bestFit: string}, numeric: {always: string, default: string, auto: string}, style: {default: string, short: string, narrow: string, long: string}}}
     */
    static opt = {
        localeMatcher: {
            bestFit: "best fit",
            lookup: "lookup",
        },
        numeric: {
            always: "always",
            auto: "auto",
        },
        style: {
            long: "long",
            narrow: "narrow",
            short: "short",
        },
    };
}
