# Docstring Parser

The docstring parser for C-like (including C++, JavaScript, Rust)
and Python-like syntax, where code that should be included in documentation is marked with custom comments.

## Syntax

A piece of code is considered a named fragment when it is located between `// BEGIN FRAGMENT: <name>` and `// END FRAGMENT`, `<>` not included. This syntax is case-sensitive.

Don't use special characters in names; `snakeCase` is preferrable.

Fragments can be included in one another. In that case the lines matching `// BEGIN FRAGMENT: <name>` and `// END FRAGMENT` are removed.

Elements between `// BEGIN ESCAPE` and `// END ESCAPE` are excluded unconditionally from the tutorial.

## Installation

Install the parser as a development dependency of your package:

```bash
npm install dst-parser --save-dev
```

Install the parser globally:

```bash
npm install dst-parser -g
```

## Example code

```ts
import { ExampleParser } from "dst-parser"
let text = `
// BEGIN FRAGMENT: Test
This text is displayed
// BEGIN ESCAPE
OR IS IT?
// END ESCAPE
// END FRAGMENT
`
let parser_inst = new ExampleParser(text)
console.log(parser_inst.mapLines())
```