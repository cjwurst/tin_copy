import { Token, TokenKind } from '../../common/intermediates.ts';
import * as syn from './/syntaxTree.ts';
import { TinError } from '../tin-errors/tinError';

export function parse(tokens: Token[]): syn.SyntaxTree {
    // Reverse token list for fast popping in helper functions.
    return parseTinDoc((tokens.reverse()));
}

export function parseTinDoc(tokens: Token[]): syn.TinDoc {
    const content = parseTextExpr(tokens);
    const eof = parseEOF(tokens);
    return syn.TinDoc.make(content, eof);
}

export function parseTextExpr(tokens: Token[]): syn.TextExpr {
    let token: Token | undefined;
    let content: syn.TextExpr.Content = {kind: 'string', payload: ''};
    let tail: syn.TextExpr | undefined = undefined;
    if (token = match(tokens, 'text')) {
        content = { kind: 'string', payload: token.lexeme };
        tail = parseTextExpr(tokens);
    } else if (token = match(tokens, 'tagOpen')) {
        content = { 
            kind: 'variable', 
            payload: parseVariableTag(tokens) 
        };
        tail = parseTextExpr(tokens);
    } 
    return syn.TextExpr.make(content, tail);
}

const DUMMY_TOKEN: Token = { kind: 'bad', lexeme: '', iChar: -1, iLine: -1};

export function parseVariableTag(tokens: Token[]): syn.VariableTag {
    let identifier: Token | undefined;
    const errors: TinError[] = [];
    if (
        !(identifier = match(tokens, 'identifier')) ||
        !match(tokens, 'tagClose')
    ) {
        pushError(errors, "Expected a variable tag.", 
            peek(tokens)?? DUMMY_TOKEN);
    }
    return { 
        ...syn.VariableTag.make(identifier), 
        errors: errors 
    };
}

export function parseEOF(tokens: Token[]): syn.EOF {
    const errors: TinError[] = [];
    if (!match(tokens, 'eof')) {
        pushError(
            errors,
            'Expected the end of the email body.',
            peek(tokens)?? DUMMY_TOKEN
        )
    }
    return { ...syn.EOF.make(), errors: errors };
}

/**
* Pop the next token if its kind is `kind`.
*/
function match(
    tokens: Token[],
    kind: TokenKind
): Token | undefined {
    return next(tokens, (k) => k == kind);
}

/**
* Pop the next token from `tokens`, optionally if it passes a predicate.
*/
function next(
    tokens: Token[], 
    predicate: (k: TokenKind) => boolean = (_) => true
): Token | undefined {
    let token = peek(tokens);
    if (token? predicate(token.kind): false) {
        return tokens.pop() ?? undefined;
    }
    return undefined;
}

function peek(
    tokens: Token[], 
    ahead: number = 0
): Token | undefined {
    return (tokens.length > ahead)? tokens[tokens.length-ahead-1] : undefined;
}

function pushError(errors: TinError[], message: string, token: Token) {
    errors.push({ 
        kind: 'syntax',
        message: message, 
        iLine: token.iLine, 
        iChar: token.iChar 
    });
}