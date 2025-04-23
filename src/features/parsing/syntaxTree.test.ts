import { test, fc } from '@fast-check/vitest';
import { expect } from 'vitest';
import { SyntaxTree } from './syntaxTree';
import { toPrettyString } from './prettyPrinter';
import { Token, TokenKind, Symbol } from '../lexing/scanner';

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

test.prop(getTokenArbs([
    TokenKind.Text,
    TokenKind.Text,
    TokenKind.TagOpen,
    TokenKind.Identifier,
    TokenKind.TagClose,
    TokenKind.Text,
    TokenKind.EOF
]))('should parse a sequence of variable tags and text blocks', 
    (...tokens) => {
        console.log(toPrettyString(SyntaxTree.parseFromTokens(tokens)));

    }
);

function getTokenArb(kind: TokenKind): fc.Arbitrary<Token> {
    return tokenArb.get(kind)?? badTokenArb;
}

function getTokenArbs(kinds: TokenKind[]): fc.Arbitrary<Token>[] {
    return kinds.map((k) => getTokenArb(k));
}