declare class ExampleSyntaxError extends Error {
    constructor(message?: string);
}
declare function trimEmptyLines(lines: Array<string>): string[];
declare class ExampleParser {
    lines: Array<string>;
    constructor(content: string);
    detectLineType(line: string): Array<string> | null;
    retrieveTextSection(start: number, end: number, ignore: Array<number>): string | null;
    mapLines(): {
        [name: string]: string;
    };
}

export { ExampleParser, ExampleSyntaxError, trimEmptyLines };
