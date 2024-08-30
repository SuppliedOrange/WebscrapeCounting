import { Terminal, terminal } from "terminal-kit";
import Logger from "../logger/Logger.ts";
import Scraper from "../webscraper/Scraper.ts";
import ScrapeQuery from "../types/ScrapeQuery.ts";
import { EventEmitter } from "events";

export interface CommandLineInterfaceConstructor {

    logger?: Logger;
    userDevice?: string;
    scraper?: Scraper;
    scrapeQueries: ScrapeQuery[];

}

export default class CommandLineInterface {

    private logger: Logger;
    private scrapeQueries: ScrapeQuery[];
    private scraper: Scraper;
    private userDevice: string;
    private isScraping: Boolean = false;
    private tableMaker: TableMaker;
    private state: "menu" | "scraper" = "menu";

    constructor ( props: CommandLineInterfaceConstructor)
    {       
        this.scrapeQueries = props.scrapeQueries
        
        if (props) {
            if (props.logger) this.logger = props.logger;
            if (props.userDevice) this.userDevice = this.userDevice;
        }
        
        terminal.on( 'key', (_name: string, matches: string[], _data: unknown) => {
            // Add ability to quit scraping prematurely.
            if ( matches.indexOf( 'q' ) >= 0 && this.isScraping ) this.isScraping = false;
            // Add ability to exit to menu.
            else if ( matches.indexOf( 'q' ) >= 0 && this.state == "scraper") this.renderIntro();
            // Add keyboard interrupt ability.
            if ( matches.indexOf( 'CTRL_C' ) >= 0 ) this.stop("keyboard interrupt")
        });

        this.scraper = props?.scraper || new Scraper({
            logger: this.logger,
            device: this.userDevice
        })

    }

    async start() {

        await this.scraper.start();
        this.renderIntro();

    }
    
    private renderIntro() {

        this.state = "menu";

        terminal.clear();

        terminal("^cWebscrape^ Counting\n");
        let options = ["Start", "Exit"]

        terminal.singleLineMenu( options,

            { selectedStyle: terminal.dim.blue.bgBlue},

            (error, response) => {

                if (error) this.error(error);
                if (response.selectedIndex == 1) return this.stop(response.selectedText);
                if (response.selectedText) return this.renderLimits();

                this.renderIntro();

            }

        )
    }

    private async renderLimits() {

        terminal.clear();

        terminal("^cWebscrape^ Counting\n");

        let startFrom: number = await this.askForNumber("Start from: ", 1);
        let endAt: number = await this.askForNumber("End at:     ", this.scrapeQueries.length);

        this.startScraping( startFrom, endAt );

    }

    private async startScraping(start: number, end: number) {

        this.state = "scraper";

        let trimmedData = this.scrapeQueries.slice( start - 1, end );

        this.tableMaker = new TableMaker(
            "^cWebscrape^ Counting",
            {
                feedbacker: this.scraper.feedbacker,
                logPath: (this.logger) ? this.logger.filePath : undefined,
                total: trimmedData.length
            }
        )

        this.isScraping = true;

        let completed: ScrapeQuery[] = [];
        let errored: ScrapeQuery[] = [];

        for (const scrapeQuery of trimmedData) {

            if (!this.isScraping) break;

            this.tableMaker.updateCurrentNumber( scrapeQuery.number );

            try {
                await this.scraper.fetchNumber( scrapeQuery );
                this.tableMaker.addCompleted(scrapeQuery);
                completed.push(scrapeQuery);
            }
            catch (error) {
                this.tableMaker.addErrored(scrapeQuery);
                errored.push(scrapeQuery);
            }

        }

        this.isScraping = false;
        this.tableMaker.updateFooter("^gScraping is finished. Press q to return.^");

    }

    private async askForNumber ( prompt?: string, defaultNumber?: number ) {

        return new Promise<number>( (resolve, reject) => {

            if (prompt) terminal(prompt);
            
            terminal.inputField(

                { default: defaultNumber?.toString() },

                async ( error, input ) => {

                    terminal("\n");

                    if (error) return this.error(error);
                    if (!input) return this.askForNumber( prompt, defaultNumber );

                    if (!parseInt(input)) {
                        terminal.red("Invalid Number\n")
                        return resolve(await this.askForNumber( prompt, defaultNumber ));
                    }

                    return resolve( parseInt(input) );

                }
            )

        })
    }

    public async stop ( type: string ) {
        terminal.red(`Terminated process [${type}]\n`);
        if (this.scraper && this.scraper.isActive) await this.scraper.stop();
        process.exit();
    }

    private log ( message: string ) {
        if (this.logger) this.logger.log("debug", message, "CLI");
    }

    private async error ( error: any, silent: Boolean = false ) {
        if (this.logger) this.logger.log("error", error, "CLI");
        if (!silent) {
            if (terminal) terminal(`^rError: ${error}^\nCheck logs (if logger was attached) for more information\n`);
            this.stop("error")
        }
    }

}

interface TableMakerValues {

    completed: ScrapeQuery[],
    errored: ScrapeQuery[],
    total: number,

    currentNumberProgressPercent: number,
    currentNumber: number,

    logs: string[], 
    logLimit: number,
    liveLogPreview: Boolean,
    logPath?: string,

    feedbacker?: EventEmitter

    tableOptions: Partial<Terminal.TextTableOptions>,
    footer: string

}

class TableMaker {

    private values: TableMakerValues = {

        completed: [],
        errored: [],
        total: 0,

        currentNumberProgressPercent: 0,
        currentNumber: 0,

        logPath: undefined,
        logs: [],
        logLimit: 5,
        liveLogPreview: true,

        tableOptions: {
            hasBorder: true,
            contentHasMarkup: true,
            borderChars: "lightRounded",
            textAttr: { bgColor: 'default' },
        },
        footer: "^y'q' to stop^",

        feedbacker: undefined

    };

    constructor(
        public title: string,
        private customValues?: Partial<TableMakerValues>
    ){
        this.values = Object.assign(this.values, customValues);
        if (customValues?.feedbacker) this.addFeedbacker(customValues.feedbacker);
    }

    public render() {

        terminal.clear();

        let format = [
            [this.title],
            [this.renderStatuses()]
        ]

        if (this.values.logPath) {

            let logsArea = "";

            logsArea += `^yLogs^ -> ${this.values.logPath}\n`;

            if (this.values.liveLogPreview) logsArea += this.renderLogs();

            format.push([ logsArea ]);

        }

        if (this.values.footer) format.push([this.values.footer]);

        terminal.table(format, this.values.tableOptions);

    }

    private renderStatuses() {

        let difference = this.values.total - (this.values.completed.length + this.values.errored.length);
        // Find the % of completion of the whole scraping process.
        const totalPercentage = () => 100 - (( difference / this.values.total ) * 100);

        let statuses = [
            {
                "Status": "",
                "Completed:": this.values.completed.length,
                "Errored:": this.values.errored.length,
                "Total:": this.values.total,
                "": " ",
                [this.renderPastNumbers()]: " "
            },
            {
                "Current": "",
                "Scraping": `${this.values.currentNumber}/${this.values.total}`,
                "": " ",
                // Render the % of the completion of scraping the current number.
                [`Scraping ${this.values.currentNumber} (${this.values.currentNumberProgressPercent}%)`]: "",
                [this.renderProgressBar(this.values.currentNumberProgressPercent)]: "",
                // Render the % of completion of the whole scraping process.
                [`${difference} left to go.`]: " ",
                [this.renderProgressBar(totalPercentage())]: " "
            }
        ]

        function padIntoStringArray( object: {[key: string]: unknown}, defaultSpace: number = 1 ) {

            let longestString = Object.keys(object).reduce( (a,b) => a.length > b.length ? a : b );
            let finalArray: string[] = [];
            Object.keys(object).forEach( key => {
                let spacing = (longestString.length - key.length) + defaultSpace;
                finalArray.push( key + " ".repeat(spacing) + object[key] );
            })
            return finalArray;

        }

        let statusesArray = statuses.map( status => padIntoStringArray(status) );

        function mergeStatusRows( defaultSpace: number = 3, ...statusArrays: string[][] ) {

            let finalArray: string[] = [];
            let longestStringArray = statusArrays.reduce( (a,b) => a.length > b.length ? a : b );

            function getItemAtIndexOfAllStringArrays( index: number ) {

                let items: string[] = [];

                statusArrays.forEach( statusArray => {

                    if (statusArray.length <= index) {
                        let longestStringLength = statusArray.reduce( (a,b) => a.length > b.length ? a : b ).length;
                        items.push( " ".repeat(longestStringLength) )
                    }
                    else {
                        items.push( statusArray[index] );
                    }

                })

                return items;

            }

            function colorizeTitle(text: string) { return `^y${text}^ ` }

            for ( let index = 0; index < longestStringArray.length; index++ ) {

                let rowItems = getItemAtIndexOfAllStringArrays(index);

                if (index == 0) rowItems = rowItems.map( title => colorizeTitle(title) );

                finalArray.push( rowItems.join(" ".repeat(defaultSpace)) + "\n" );

            }

            return finalArray;

        }

        return mergeStatusRows( 6, ...statusesArray ).join('');

    }

    private renderPastNumbers( limit: number = 5 ) {

        let allPastNumbers: ScrapeQuery[] = []
        allPastNumbers = allPastNumbers.concat(
            this.values.completed,
            Object.assign(this.values.errored, {failed: true})
        );

        let finalString = '';

        allPastNumbers.slice( limit * -1 ).forEach( pastNumber => {
            if (pastNumber["failed"]) finalString += `^r${pastNumber.number}^ `;
            else finalString += `${pastNumber.number} `; 
        })

        return finalString;

    }

    private renderProgressBar( currentPercent: number, progress_bar_width?: number ) {

        let finishedCharacter = "\u2588";
        let unfinishedCharacter = "\u2591";

        progress_bar_width = progress_bar_width || 21;

        let completedBars = Math.round(progress_bar_width * ( currentPercent / 100));
        
        return `${ finishedCharacter.repeat( completedBars ) }${ unfinishedCharacter.repeat( progress_bar_width - completedBars ) }`;

    }

    private renderLogs() {
        
        let logs: string[] = [];
        for (const log of this.values.logs) {
            logs.push(`* ${log}\n`);
        }
        return logs.join('');
    }

    public addFeedbacker( feedbacker: EventEmitter ) {

        this.values.feedbacker = feedbacker;
        this.values.feedbacker.on('log', (feedback:{ level: string, message: string, label: string }) => this.addLog(feedback));
        this.values.feedbacker.on('progressupdate', (feedback: number) => this.updateProgressBar(feedback))

    }

    public updateProgressBar( newProgressPercentage: number ) {

        this.values.currentNumberProgressPercent = newProgressPercentage;
        this.render();

    }

    public updateFooter( newFooter: string ) {

        this.values.footer = newFooter;
        this.render();

    }

    public updateCurrentNumber( newNumber: number ) {

        this.values.currentNumber = newNumber;
        this.render();

    }

    public updateTotalNumber( newTotal: number ) {

        this.values.total = newTotal;
        this.render();

    }


    public addCompleted(scrapeQuery: ScrapeQuery) {

        this.values.completed.push(scrapeQuery);
        this.render();

    }

    public addErrored(scrapeQuery: ScrapeQuery) {

        this.values.errored.push(scrapeQuery);
        this.render();

    }

    public toggleLiveLogPreview() {

        this.values.liveLogPreview = !this.values.liveLogPreview;
        this.render();

    }

    private addLog( feedback: { level: string, message: string, label: string } ) {

        let log = `(${feedback.label.toUpperCase()}) ${feedback.message}`;
        if (feedback.level.toLowerCase() == "error") log = `^r${log}^`;

        if (this.values.logs.length == this.values.logLimit) this.values.logs.shift();

        this.values.logs.push(log);

        this.render();

    }
    
}