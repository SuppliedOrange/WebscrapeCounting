import data from "./data/numbers.ts";
import { CLI, Logger } from ".";

let logger = new Logger({
    name: "cli",
    level: "debug"
})
let cli = new CLI({
    scrapeQueries: data,
    logger: logger
});

cli.start();