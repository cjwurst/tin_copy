import { fc } from '@fast-check/vitest';
import { Token, TokenKind, TinSymbol } from '../../../common/token';

export const badTokenArb = fc.constant(makeSimpleToken('', 'bad', 0, 0));

export const tokenArb = new Map<
    TokenKind, 
    fc.Arbitrary<Token>
>([
    ['text', fc.string().map((s) => makeSimpleToken(s, 'text', 0, 0))],
    ['tagClose', fc.constant(makeSimpleToken(
        TinSymbol.DoubleRightBracket, 
        'tagClose', 
        0, 0)
    )],
    ['tagOpen', fc.constant(makeSimpleToken(
        TinSymbol.DoubleLeftBracket, 
        'tagOpen', 
        0, 0
    ))],
    ['eof', fc.constant(makeSimpleToken(
        '',
        'eof',
        0, 0
    ))],
    ['identifier', fc.string().filter(s => s.length > 0).map((s) => 
        makeSimpleToken(s, 'identifier', 0, 0)
    )],
    ['bad', badTokenArb]
]);

export const symbolArb = fc.constantFrom(
    ...Object.values(TinSymbol).map((s) => s as string)
);

export const sourceArb = fc.array(symbolArb).map((l) => l.join(''));

function makeSimpleToken(
    lexeme: string, 
    kind: TokenKind, 
    iChar: number, 
    iLine: number
): Token {
    return { lexeme: lexeme, kind: kind, iChar: iChar, iLine: iLine };
}