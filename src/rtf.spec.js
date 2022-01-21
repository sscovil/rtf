import RTF from "./rtf.js";

describe("RTF", () => {
    describe("instance with default options", () => {
        let rtf;

        beforeEach(() => {
            rtf = new RTF();
        });

        describe("addLocale", () => {
            test("returns false if language is not supported", () => {
                const locale = "invalid";
                const result = rtf.addLocale(locale);
                expect(result).toBe(false);
                expect(rtf.formatters[locale] instanceof Intl.RelativeTimeFormat).toBe(false);
            });

            test("returns true if language is supported", () => {
                const locale = "de-DE";
                const result = rtf.addLocale(locale);
                expect(result).toBe(true);
                expect(rtf.formatters[locale] instanceof Intl.RelativeTimeFormat).toBe(true);
            });

            test("returns true even if language has already been added", () => {
                const locale = "es";
                const result1 = rtf.addLocale(locale);
                const result2 = rtf.addLocale(locale);
                expect(result1).toBe(true);
                expect(result2).toBe(true);
                expect(rtf.formatters[locale] instanceof Intl.RelativeTimeFormat).toBe(true);
            });
        });

        describe("format", () => {
            test("accepts a Date object as the first argument", () => {
                const date = new Date();
                const result = rtf.format(date);
                expect(result).toMatch(/(now|1 second ago|2 seconds ago)/);
            });

            test("accepts a UTC string as the first argument", () => {
                const date = new Date().toUTCString();
                const result = rtf.format(date);
                expect(result).toMatch(/(now|1 second ago|2 seconds ago)/);
            });

            test("accepts a numeric timestamp as the first argument", () => {
                const date = Date.now();
                const result = rtf.format(date);
                expect(result).toMatch(/(now|1 second ago|2 seconds ago)/);
            });

            test("accepts a locale string as the second argument", () => {
                const today = new Date();
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                const result = rtf.format(yesterday, "zh");
                expect(result).toBe("昨天");
            });

            test("works with future dates", () => {
                const today = new Date();
                const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
                const result = rtf.format(tomorrow);
                expect(result).toBe("tomorrow");
            });

            test("formats minutes properly", () => {
                const today = new Date();
                const minutesAgo = new Date(today.getTime() - 30 * 60 * 1000);
                const result = rtf.format(minutesAgo);
                expect(result).toBe("30 minutes ago");
            });

            test("formats hours properly", () => {
                const today = new Date();
                const hoursAgo = new Date(today.getTime() - 12 * 60 * 60 * 1000);
                const result = rtf.format(hoursAgo);
                expect(result).toBe("12 hours ago");
            });

            test("formats days properly", () => {
                const today = new Date();
                const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                const result = rtf.format(yesterday);
                expect(result).toBe("yesterday");
            });

            test("formats weeks properly", () => {
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const result = rtf.format(lastWeek);
                expect(result).toBe("last week");
            });

            test("formats months properly", () => {
                const today = new Date();
                const lastMonth = new Date(today.getTime() - (365/12) * 24 * 60 * 60 * 1000);
                const result = rtf.format(lastMonth);
                expect(result).toBe("last month");
            });

            test("formats years properly", () => {
                const today = new Date();
                const lastYear = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                const result = rtf.format(lastYear);
                expect(result).toBe("last year");
            });
        });
    });

    describe("instance with custom options", () => {
        let rtf;

        beforeEach(() => {
            rtf = new RTF({
                localeMatcher: RTF.opt.localeMatcher.lookup,
                numeric: RTF.opt.numeric.always,
                style: RTF.opt.style.short
            });
        });

        describe("format method", () => {
            test("uses the specified options", () => {
                const today = new Date();
                const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const result = rtf.format(lastWeek, "fr");
                expect(result).toBe("il y a 1 sem.");
            });
        });
    });

    describe("static", () => {
        describe("httpMiddleware method", () => {
            test("returns a function", () => {
                const middleware = RTF.httpMiddleware();
                expect(typeof middleware === "function").toBe(true);
            });

            test("middleware adds req.rtf function that formats dates using req.language", (done) => {
                const rtf = new RTF();
                const middleware = RTF.httpMiddleware(rtf);
                const req = { language: "ja" };
                const res = {};
                const next = () => {
                    try {
                        const ts = Date.now() - 30 * 60 * 1000;
                        const result = req.rtf(ts);
                        expect(result).toBe("30 分前");
                        done();
                    } catch (err) {
                        done(err);
                    }
                };
                middleware(req, res, next);
            });

            test("allows you to specify property names to use for req context", (done) => {
                const rtf = new RTF();
                const middleware = RTF.httpMiddleware(rtf, "relativeTimeFormat", "lng");
                const req = { lng: "ru" };
                const res = {};
                const next = () => {
                    try {
                        const ts = Date.now() - 30 * 60 * 1000;
                        const result = req.relativeTimeFormat(ts);
                        expect(result).toBe("30 минут назад");
                        done();
                    } catch (err) {
                        done(err);
                    }
                };
                middleware(req, res, next);
            });
        });
    });
});
