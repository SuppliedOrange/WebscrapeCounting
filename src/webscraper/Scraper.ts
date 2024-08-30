import { Browser, BrowserContext, chromium, devices, Page } from 'playwright';
import ScrapeQuery from '../types/ScrapeQuery.ts';
import Logger from '../logger/Logger.ts';
import EventEmitter from 'events';

/**
 * Defines the configuration options for the Scraper class.
 */
interface ScraperConstructor {
    device?: string;
    logger?: Logger;
    name?: string;
}

/**
 * Initializes a playwright webscraper and lets you fetch stuff from a chromium browser.
 * @param device: [A playwright device](https://playwright.dev/docs/api/class-playwright#playwright-devices)
 * @param logger: A Logger object.
 */

export default class Scraper {

    private page: Page;
    private browser: Browser;
    private context: BrowserContext;
    private logger: Logger;

    public name: string = "Scraper";
    public feedbacker: EventEmitter = new EventEmitter();
    public isActive: Boolean = false;
    public device: string = "Desktop Chrome";

    /**
     * Constructs a new Scraper instance with the provided configuration options.
     *
     * @param {string} props - The configuration options for the scraper {@link ScraperConstructor}.
     * @param {string} props.device - [A playwright device](https://playwright.dev/docs/api/class-playwright#playwright-devices)
     * @param {Logger} props.logger: A Logger object.
     */
    constructor ( props?: ScraperConstructor )
    {

        if (props) {
            if (props.device) this.device = props.device;
            if (props.logger) this.logger = props.logger;
            if (props.name) this.name = props.name;
        }

        this.log("Scraper object constructed.");

    }

    /**
     * Starts the scraper. Throws an error if already started.
     */
    async start() {

        if (this.isActive) throw new Error("Scraper is already active.")

        try {

            this.log("Launching chromium browser");
            this.browser = await chromium.launch();

            this.log(`Creating new browser context for device ${this.device}`);
            this.context = await this.browser.newContext(devices[this.device]);

            this.log("Opening new Page");
            this.page = await this.context.newPage();

            this.log("Successfully started Scraper.");
            this.isActive = true;

        }
        catch (error) {
            this.error( error );
        }

    }

    /**
     * Webscrapes a number and returns the number if the webscraping worked. Else throws.
     * 
     * @param scrapeQuery The scrapeQuery object to use while scraping.
     * @returns 
     */
    async fetchNumber( scrapeQuery: ScrapeQuery ) {

        try {

            this.log(`Attempting to fetch number ${scrapeQuery.number} from ${scrapeQuery.url}`);
            this.progressUpdate(10);

            if (!this.isActive) {
                throw new Error( "Use .start() before running scrape functions." );
            }
    
            // Navigate to the URL.
            this.log(`Navigating to ${scrapeQuery.url}`);
            this.progressUpdate(25);
            try {
                await this.page.goto( scrapeQuery.url, { waitUntil: "load" } );
            }
            catch (error) {
                throw new Error(`Error while navigating to ${scrapeQuery.url}\n${error}`);
            }
    
            // Evaluate the query function.
            this.log("Evaluating query function.");
            this.progressUpdate(75);
            let response: string | number;

            try {
                response = await this.page.evaluate( scrapeQuery.queryFunction );
            }
            catch (error) {
                throw new Error(`Failed to evaluate query function, error was:\n${error}`);
            }
    
            if ( !(typeof response === 'string') && !(typeof response === 'number') ) { 
                throw new Error( `Recieved object [(${typeof response}) ${response}] instead of a number.` );
            }
            
            if (response === "") {
                throw new Error( "response was empty string." );
            }
    
            // Attempt to transform the response string into a number
            this.log(`Parsing string "${response}" into a number`);
            let number: number = parseInt(response.toString());
    
            if (isNaN(number)) {
                throw new Error(`Recieved object [(${typeof response}) ${response}] resulting in NaN. Expected number in string.`);
            }
    
            if (number != scrapeQuery.number) {
                throw new Error(`Mismatched number. Expected ${scrapeQuery.number} but got ${number}`);
            }
            
            this.progressUpdate(100);
            this.log(`Finished fetch, returned number ${number}`)
            return number;
            
        }

        catch (error) { this.error( error ) }

    }

    /**
     * Stops the scraper. Throws if already stopped.
     */
    async stop() {

        if (!this.isActive) throw new Error("Scraper is not active.")

        this.log("Closing browser context");
        await this.context.close();
        this.log("Closing browser.")
        await this.browser.close();

        this.log("Successfully stopped scraper.")
        this.isActive = false;

    }

    /**
     * Updates the progress bar through the feedbacker.
     * 
     * @param {number} percent The number in %; Example 50, 12, 77 etc.
     */
    private progressUpdate( percent: number ) {
        this.feedbacker.emit('progressupdate', percent);
    }

    /**
     * Logs a debug message if a logger is provided. Also sends log through feedbacker.
     * 
     * @param {string} message The message to log
     */
    private log( message: string ) {
        this.feedbacker.emit('log', { level: "debug", message: message, label: this.name });
        if (this.logger) this.logger.log("debug", message, this.name);
    }

    /**
     * Logs an error message, then throws an error. Also sends log through feedbacker.
     * 
     * @param error The error message or object
     */
    private error( error: any ) {
        this.feedbacker.emit('log', { level: "error", message: error, label: this.name });
        if (this.logger) this.logger.log("error", error, this.name);
        throw error;
    }

}