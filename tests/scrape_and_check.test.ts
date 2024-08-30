import ScrapeQuery from "../src/types/ScrapeQuery";
import TestResult from "../src/types/TestResult";
import { Logger, Scraper } from "..";

export default async ( data: ScrapeQuery[] ) => {

    // Create a logger
    const logger = new Logger({
        name: "Scrape Test",
        level: "debug"
    })

    // Create a scraper
    const scraper = new Scraper({
        logger: logger
    })

    // Start the scraper
    await scraper.start();

    // Scrape all numbers in data
    for (const scrapeQuery of data) {
        
        try {
            await scraper.fetchNumber(scrapeQuery);
        }
        catch (error) {
            // Stop the scraper
            await scraper.stop();
            // If there's an error while fetching the number, fail the test
            return new TestResult(
                "Scrape Test",
                `Number ${scrapeQuery.number} failed to scrape`,
                "FAIL",
                `While scraping ${scrapeQuery.url} for number ${scrapeQuery.number}, this error occurred:\n${error}\nAll logs at: ${logger.filePath}`
            )
        }

    }

    // Stop the scraper
    await scraper.stop();

    // Return success
    return new TestResult(
        "Scrape Test",
        "All numbers passed",
        "PASS",
        "Everything was successfully scraped. No errors were hit."
    )

}