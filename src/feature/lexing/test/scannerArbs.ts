import { fc } from '@fast-check/vitest';
import { Token, TokenKind, TinSymbol } from '../scanner';

export const badTokenArb = fc.constant(new Token('', TokenKind.Bad, 0, 0));

export const tokenArb = new Map<
    TokenKind, 
    fc.Arbitrary<Token>
>([
    [TokenKind.Text, fc.string().map((s) => 
        new Token(s, TokenKind.Text, 0, 0)
    )],
    [TokenKind.TagClose, fc.constant(new Token(
        TinSymbol.DoubleRightBracket, TokenKind.TagClose, 0, 0
    ))],
    [TokenKind.TagOpen, fc.constant(new Token(
        TinSymbol.DoubleLeftBracket, TokenKind.TagOpen, 0, 0
    ))],
    [TokenKind.EOF, fc.constant(new Token(
        '', TokenKind.EOF, 0, 0
    ))],
    [TokenKind.Identifier, fc.string().filter((s) => s.length > 0).map((s) => 
        new Token(s, TokenKind.Identifier, 0, 0)
    )],
    [TokenKind.Bad, badTokenArb]
]);

export const symbolArb = fc.constantFrom(
    ...Object.values(TinSymbol).map((s) => s as string)
);

export const sourceArb = fc.array(symbolArb).map((l) => l.join(''));