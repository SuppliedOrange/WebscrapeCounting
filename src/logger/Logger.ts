import winston from "winston";
import { resolve } from "path";

/**
 * Defines the configuration options for the Logger class.
 */
interface LoggerConstructor {
    name: string;
    filePath?: string;
    level?: string;
    logToConsole?: boolean;
    fileDescriptorFlag?:string;
}

/**
 * Creates a customizable Winston logger for logging messages to a file and/or the console.
 */
export default class Logger {

    private logger: winston.Logger;
    public name: string;
    public level: string = "none";
    public filePath: string;
    private logToConsole: boolean = false;
    private fileDescriptorFlag: string = "w";

    /**
     * Constructs a new Logger instance with the provided configuration options. 
     *
     * @param {string} props - The configuration options for the logger. {@link LoggerConstructor}
     * @param {string} props.name - The name of the logger and the default label for logs.
     * @param {string} props.filepath - Path to the log file. Defaults to ./logs/<name>.log
     * @param {string} props.level - The logging level ("info", "warn", "error", etc.). Defaults to none.
     * @param {boolean} props.logToConsole - Whether to log to the console. Defaults to false.
     * @param {string} props.fileDescriptorFlag - The flag to use when opening a file ("w", "w+", "a" etc). Defaults to "w".
     */
    constructor(props: LoggerConstructor) {

        // Set name of logger.
        this.name = props.name;

        // Find and add options.
        if (props.level !== undefined) this.level = props.level;
        if (props.logToConsole !== undefined) this.logToConsole = props.logToConsole;
        if (props.fileDescriptorFlag !== undefined) this.fileDescriptorFlag = props.fileDescriptorFlag;

        // Find and add file path or add the default path.
        if (props.filePath !== undefined) this.filePath = props.filePath;
        else this.filePath = resolve(`./logs/${this.name}.log`);

        this.logger = winston.createLogger({

            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.prettyPrint()
            )

        });

        this.logger.add(
            new winston.transports.File({
                level: this.level,
                filename: this.filePath,
                options: { flags: this.fileDescriptorFlag },
            })
        );

        if (this.logToConsole) {
            this.logger.add(
                new winston.transports.Console({
                    level: this.level,
                })
            );
        }

    }

    /**
     * Logs a message to the configured file and/or console.
     *
     * @param {string} level - The logging level ("info", "warn", "error", etc.).
     * @param {string} message - The message to log.
     * @param {string} [label=this.name] - Optional label for the log message.
     */
    log(level: string, message: string, label: string = this.name) {
        this.logger.log({
            level: level,
            message: `(${label}): ${message}`,
        });
    }
}