import fs from "fs";
import data from "./data/numbers.ts";
import ScrapeQuery from "./src/types/ScrapeQuery.ts";
import TestResult from "./src/types/TestResult.ts";

async function main() {

    let args = getArgs();
    let sortedData = data.sort( (a, b) => a.number - b.number )
    let startFrom = args.start || sortedData[0].number;
    let endAt = args.end || sortedData[ sortedData.length - 1 ].number;

    if (startFrom < sortedData[0].number) {
        throw new Error( `The minimum amount to start from is ${sortedData[0].number}` );
    }

    let scrapeQueries = sortedData.slice( startFrom - 1, endAt );

    const testFiles: string[] = [];
    const tests: Map<string, (data: ScrapeQuery[]) => Promise<TestResult>> = new Map();

    // Find all test files
    fs.readdirSync("./tests/")
    .filter(f => f.endsWith('.test.ts'))
    .forEach( file => testFiles.push(file));

    // Import all test files.
    for (const file of testFiles) {

        // Import the functions from all .test.ts files in ./tests/
        const testFunction: (data: ScrapeQuery[]) => Promise<TestResult> = (
             await import(`./tests/${file}`) 
        ).default;
        
        console.log(`Loaded test ${file}`);
        tests.set(file, testFunction);

    }

    let testResults: Map<string, TestResult> = new Map();

    for (const test of tests) {

        let [name, testFunction] = test;

        console.log(`Running test ${name}`);
        let result = await testFunction( scrapeQueries );
        console.log(result);

        testResults.set( name, result );

    }

    for (const testResult of testResults) {

        let [name, result] = testResult;

        if (result.status != "PASS") {

            let errorMessage = `\nTest Failure!\nError: ${result.name}\nAt: ${result.initiator}\nReason: ${result.reason}`;
            throw new Error(errorMessage);

        }       

    }

    console.log("All tests passed without errors.")

}

// https://stackoverflow.com/questions/4351521/how-do-i-pass-command-line-arguments-to-a-node-js-program-and-receive-them
// Gets command line arguments for us.
function getArgs () {
    return process.argv.reduce(
        (args: {[key: string]: any}, arg) => {
            if (arg.slice(0, 2) === "--") {
                const longArg = arg.split("=");
                const longArgFlag = longArg[0].slice(2);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            return args;
        }, {}
    );
}

main()