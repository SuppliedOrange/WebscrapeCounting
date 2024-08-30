export default class TestResult {

    constructor(
        public initiator: string,
        public name: string,
        public status: "PASS" | "FAIL" | "SKIPPED",
        public reason: string
    ){
        this.name = name;
        this.status = status;
        this.reason = reason;
    }

}