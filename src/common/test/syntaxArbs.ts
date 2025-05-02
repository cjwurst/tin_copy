import { fc } from '@fast-check/vitest';
import { Token, TokenKind } from '../../feature/lexing/scanner';
import { badTokenArb, tokenArb } from '../../feature/lexing/test/scannerArbs';

/* Casting is necessary throughout this definition since the return type of 
`tie` is `fc.Arbitrary<unknown>` */
export const wellFormedTokensArb = 
fc.letrec((tie) => ({
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

export function getTokenArb(kind: TokenKind): fc.Arbitrary<Token> {
    return tokenArb.get(kind)?? badTokenArb;
}

export function getTokenArbs(...kinds: TokenKind[]): fc.Arbitrary<Token>[] {
    return kinds.map((k) => getTokenArb(k));
}