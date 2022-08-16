declare function ExampleSyntaxError(message?: string): void;
declare namespace ExampleSyntaxError {
    var prototype: Error;
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
