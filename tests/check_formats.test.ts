import ScrapeQuery from "../src/types/ScrapeQuery";
import TestResult from "../src/types/TestResult";

export default ( data: ScrapeQuery[] ) => {

    let previous = data[0].number - 1;

    for ( const scrapeQuery of data ) {

        if (! (typeof scrapeQuery.number === "number") ) {
            return new TestResult(
                "Check Formats",
                `After number ${previous}`,
                "FAIL",
                `'number' property of object is not an integer.\nExpected number but got ${typeof scrapeQuery.number}.${(scrapeQuery.url) ? `\nFound URL ${scrapeQuery.url} associated with it.` : ""}`
            )
        }

        if (!scrapeQuery.url) {
            return new TestResult(
                "Check Formats",
                `Number ${scrapeQuery.number}`,
                "FAIL",
                `Scrape Query does not have a URL.\nExpected string and got ${scrapeQuery.url}.\nURL I found was "${scrapeQuery.url}"`
            )
        }

        if (! (typeof scrapeQuery.url === "string") ) {
            return new TestResult(
                "Check Formats",
                `Number ${scrapeQuery.number}`,
                "FAIL",
                `'url' property of object is not a string.\nExpected string and got ${scrapeQuery.url}.\nURL I found was "${scrapeQuery.url}"`
            )
        }

        if (! (typeof scrapeQuery.queryFunction === "function") ) {
            return new TestResult(
                "Check Formats",
                `Number ${scrapeQuery.number}`,
                "FAIL",
                `'queryFunction' property of object is not a function\nExpected function and got ${typeof scrapeQuery.queryFunction}.`
            )
        }

        let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*/gi);
        if (!scrapeQuery.url.match(urlRegex)) {
            return new TestResult(
                "Check Formats",
                `Number ${scrapeQuery.number}`,
                "FAIL",
                `URL does not match the URL regex, rejected.\nURL: "${scrapeQuery.url}"`
            )
        }

        previous = scrapeQuery.number

    }

    return new TestResult(
        "Check Formats",
        "All numbers passed",
        "PASS",
        "There were no formatting errors. All numbers passed."
    )

}