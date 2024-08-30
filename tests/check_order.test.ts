import ScrapeQuery from "../src/types/ScrapeQuery";
import TestResult from "../src/types/TestResult";

export default ( data: ScrapeQuery[] ) => {

    // Get a sorted list of all numbers
    let numbers: number[] = data.map( x => x.number ).sort( (a, b) => a - b );
    let minNumber = numbers[0];

    // Set the previous number to the lowest number - 1
    let previousNumber = minNumber - 1;

    for (const number of numbers) {

        // We expect the previous number + 1.
        let expectedNumber = previousNumber + 1;

        // If the current number is not what we expect, fail
        if ( number != expectedNumber ) {

            return new TestResult(
                "Check Order",
                `Number ${expectedNumber}`,
                `FAIL`,
                `Numbers are not in sequence. Expected ${expectedNumber} after ${previousNumber}, but instead got ${number}`
            )

        }

        // Set previous number to this number.
        previousNumber = number;

    }

    return new TestResult(
        "Check Order",
        "All numbers passed",
        "PASS",
        "There was no error in the order. All numbers passed."
    )

}