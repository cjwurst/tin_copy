import { fc } from '@fast-check/vitest';
import { Token, TokenKind } from '../token';
import { badTokenArb, tokenArb } from '../../feature/lexing/test/scannerArbs';
import { SyntaxTree } from '../syntaxTree';
import reportErrors, { ErrorReport } from '../../feature/parsing/errorReporter';
import parse from '../../feature/parsing/parser';

export class ParseResult { 
    constructor(
        public readonly tokens: readonly Token[],
        public readonly root: SyntaxTree,
        public readonly errorReport: ErrorReport
    ) {}

    public toString(): string {
        return '\n' + this.tokens
            .map((t) => '    ' + t.toString())
            .join('\n') + '\n  ';
    }
};

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

export const wellFormedParseArb:fc.Arbitrary<ParseResult> = wellFormedTokensArb.map((tokens) => {
    const root = parse(tokens.slice());
    return new ParseResult(tokens, root, reportErrors(root));
});

export function getTokenArb(kind: TokenKind): fc.Arbitrary<Token> {
    return tokenArb.get(kind)?? badTokenArb;
}

export function getTokenArbs(...kinds: TokenKind[]): fc.Arbitrary<Token>[] {
    return kinds.map((k) => getTokenArb(k));
}