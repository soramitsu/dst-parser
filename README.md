# Example docstring parser

A source code docstring parser for a custom C-like (including C++, JavaScript, Rust)
and Python-like syntax, where documentation sections are marked in comments using
`FRAGMENT` and `ESCAPE` statements.

## Syntax

A text is considered a named fragment when it is located between `// BEGIN FRAGMENT: <name>` and `// END FRAGMENT`, `<>` not included. This syntax is case-sensitive.

Don't use special characters in names; `snakeCase` is preferrable.

Fragments can be included in one another. In that case the lines matching `// BEGIN FRAGMENT: <name>` and `// END FRAGMENT` are removed.

Elements between `// BEGIN ESCAPE` and `// END ESCAPE` are excluded unconditionally from the tutorial.

## Installation

* `npm install dst-parser --save-dev` if you want to install it as a development dependency of your package.
* `npm install dst-parser -g` to install the parser globally.

## Example code

```rust
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