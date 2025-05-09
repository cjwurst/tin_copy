# Overview
This document provides a high-level description of each step in the process of turning a TinCopy template into a complete draft. 

# Steps
Each step of the process is implemented in a subdirectory of `./feature` (with the exception of parsing - see the first comment in `./feature/parsing/parser.ts`.) 

The inputs/outputs of each step are located in `./common`. As a result, each step need only import from `./common`. The `./feature` subdirectories then represent fully encapsulated modules whose interface is the default exported function in the main file in each subdirectory.

## Lexing
The scanner maps the plain text of a template, a `string`, to a list of semantically meaningful tokens, a `Token[]`.

### Use
Call `scan` from `./feature/lexing/scanner.ts`.

### Failure
The scanner must be able to distinguish between plain text and tag text so that it can scan each symbol as part of a string literal or a symbol in a tag respectively. Lexing fails if the template does not clearly transition between plain text and text within a tag, e.g. two tag opens appear with no interceding tag close.

## Parsing
The parser maps a list of tokens, a `Token[]`, to an abstract syntax tree, a `SyntaxTree`, and a collection of TinCopy variable definitions, a `TinContext`.

### Use
Call `parse` from `./feature/parsing/

### Failure
Parsing may fail for any invalid syntax except those caught by the scanner above. Errors are recorded in each node of the syntax tree where it is first encountered. 

