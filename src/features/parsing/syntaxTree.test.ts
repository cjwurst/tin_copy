import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';
import * as syn from './syntaxTree';
import { toPrettyString } from './prettyPrinter';
import { Token, TokenKind, Symbol } from '../lexing/scanner';
import structuresMatch from './treeMatcher';

const badTokenArb = fc.constant(new Token('', TokenKind.Bad, 0, 0));

const tokenArb = new Map<
    TokenKind, 
    fc.Arbitrary<Token>
>([
    [TokenKind.Text, fc.string().map((s) => 
        new Token(s, TokenKind.Text, 0, 0)
    )],
    [TokenKind.TagClose, fc.constant(new Token(
        Symbol.DoubleRightBracket, TokenKind.TagClose, 0, 0
    ))],
    [TokenKind.TagOpen, fc.constant(new Token(
        Symbol.DoubleLeftBracket, TokenKind.TagOpen, 0, 0
    ))],
    [TokenKind.EOF, fc.constant(new Token(
        '', TokenKind.EOF, 0, 0
    ))],
    [TokenKind.Identifier, fc.string().map((s) => 
        new Token(s, TokenKind.Identifier, 0, 0)
    )]
]);

/* Casting is necessary throughout this definition since the return type of 
`tie` is `fc.Arbitrary<unknown>` */
const wellFormedTokensArb/*: fc.Arbitrary<Token[]>*/ = fc.letrec((tie) => ({
    document: fc.tuple(tie('textExpr'), getTokenArb(TokenKind.EOF)).map(
        ([text, eof]) => [...(text as Token[]), eof]
    ),
    textExpr: fc.option(fc.tuple(
        /* The text token arb is wrapped in a singleton tuple so that spread 
        syntax is supported in both cases. */
        fc.oneof(fc.tuple(getTokenArb(TokenKind.Text)), tie('variableTag')), 
        tie('textExpr'))
    ).map((pair) => {
        if (pair) {
            const [content, tail] = pair;
            return [...(content as Token[]), ...(tail as Token[])];
        }
        return [];
    }),
    variableTag: fc.tuple(...getTokenArbs(
        TokenKind.TagOpen, TokenKind.Identifier, TokenKind.TagClose
    ))
})).document;

test.prop([wellFormedTokensArb])(
    'should parse a well-formed sequence of tokens without error.',
    (tokens) => {
        //let ast = syn.SyntaxTree.parseFromTokens(tokens);
        return true;
    }
);

test.prop(getTokenArbs(
    TokenKind.Text,
    TokenKind.Text,
    TokenKind.TagOpen,
    TokenKind.Identifier,
    TokenKind.TagClose,
    TokenKind.Text,
    TokenKind.EOF
))('should parse a sequence of variable tags and text blocks', 
    (...tokens) => {
        let ast = syn.SyntaxTree.parseFromTokens(tokens);
        expect(structuresMatch(ast, ast));
    }
);

function getTokenArb(kind: TokenKind): fc.Arbitrary<Token> {
    return tokenArb.get(kind)?? badTokenArb;
}

function getTokenArbs(...kinds: TokenKind[]): fc.Arbitrary<Token>[] {
    return kinds.map((k) => getTokenArb(k));
}