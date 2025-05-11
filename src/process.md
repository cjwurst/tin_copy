# Overview
This document provides a high-level description of each step in the process of turning a TinCopy template into a complete draft. 

# Steps
Each step of the process is implemented in a subdirectory of `./feature` (with the exception of parsing - see the first comment in `./feature/parsing/parser.ts`.) 

The inputs/outputs of each step are located in `./common`. As a result, each step need only import from `./common`. The `./feature` subdirectories then represent fully encapsulated modules whose interface is the default exported function in the main file in each subdirectory.

## Lexing
The scanner maps the plain text of a template, a `string`, to a list of syntactically meaningful tokens, a `Token[]`.

### Use
Call `scan` from `./feature/lexing/scanner.ts`.

### Failure
The scanner must be able to distinguish between plain text and tag text so that it can scan each symbol as part of a string literal or a symbol in a tag respectively. Lexing fails if the template does not clearly transition between plain text and text within a tag, e.g. two tag opens appear with no interceding tag close.

## Parsing
The parser maps a list of tokens, a `Token[]`, to an abstract syntax tree, a `SyntaxTree`, and a collection of TinCopy variable definitions, a `TinContext`.

### Use
Call `parse` from `./feature/parsing/parser`.

### Failure
Parsing may fail for any invalid syntax except those caught by the scanner above. Errors are recorded in each node of the syntax tree where it is first encountered. 

## Context Declaration
A context of type `TinContext` is created from the AST, a `SyntaxTree`. The context defines each variable and tracks its nominal type, making its type and value available to each following step.

### Use
Call `makeContext`, a static method in the `TinContext` class, passing a `SyntaxTree`.

### Failure
Any mistake in the declaration of a variable, such as declaring a variable twice or using it before it is declared, results in an error that is attached to the `TinContext` object itself.

## Type Checking
The type checker acts on the AST, a `SyntaxTree`, without changing its structure, and verifies the types of its expressions with the use of a `TinContext`.

### Use
Call `checkTypes` from `./feature/type-checking/typeChecker.ts`.

### Failure
Any expression that is not well-typed will cause this step to fail. Errors are attached to the nodes of the syntax tree alongside errors encountered during parsing.

## Form Generation
A context and an AST are used to generate a fillable form to present to the user.

### Use
Create a `<Form />` React component with props root, a `SyntaxTree`, and context, a `TinContext`.

### Failure
No failure is anticipated - previous checks should guarantee that the form will be generated.

## Draft Generation


