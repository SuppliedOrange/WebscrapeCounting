import ScrapeQuery from "../src/types/ScrapeQuery";
import TestResult from "../src/types/TestResult";

export default ( data: ScrapeQuery[] ) => {

    let domains: {domain: string; scrapeQuery: ScrapeQuery}[] = [];
    let domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img;

    for (const scrapeQuery of data) {

        // Get all matches from the string, convert it to a string[]
        let matches = Array.from( scrapeQuery.url.matchAll(domainRegex) ).flat();

        // If we don't get 2 matches, (the match and the group), fail.
        if ( matches.length < 2) {

            return new TestResult(
                "Check Repeating Domains",
                "URL failed to match regex!",
                "FAIL",
                `${scrapeQuery.url} failed to match URL regex, expected string[match, group] but instead got ${matches}`
            )

        }

        // Get the first group (domain name)
        let domain = matches[1];

        // Make a list of all the current found domains
        let domainList = domains.map(x => x.domain)

        // If the current domain has already been found, fail
        if ( domainList.includes(domain) ) {

            return new TestResult(
                "Check Repeating Domains",
                "Repeated URL found",
                "FAIL",
                `Number ${scrapeQuery.number} and number ${domains.filter( x => x.domain == domain)[0].scrapeQuery.number} have the same domain ${domain}`
            )

        }
        
        // Add this domain to the list of found domains
        domains.push({
            domain: domain,
            scrapeQuery: scrapeQuery
        })

    }

    return new TestResult(
        "Check Repeating Domains",
        "No repeating domains",
        "PASS",
        "There were no repeating domains. All links passed."
    )

}