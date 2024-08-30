export default interface ScrapeQuery {
    number: number;
    url: string;
    queryFunction: () => any;
}