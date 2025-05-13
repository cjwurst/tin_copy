import { fc } from '@fast-check/vitest';
import { Token, TokenKind } from '../token';
import { badTokenArb, tokenArb } from '../../feature/lexing/test/scannerArbs';
import * as syn from '../syntaxTree';
import reportErrors, { ErrorReport } from '../../feature/tin-errors/tinErrorReporter';
import parse from '../../feature/parsing/parser';
import { T } from 'vitest/dist/chunks/environment.d.C8UItCbf.js';

export class ParseResult { 
    constructor(
        public readonly tokens: readonly Token[],
        public readonly root: syn.SyntaxTree,
        public readonly errorReport: ErrorReport
    ) {}

    public toString(): string {
        return '\n' + this.tokens
            .map((t) => '    ' + t.toString())
            .join('\n') + '\n  ';
    }
};

type ASTTypeMap<T> = {
    document: T,
    textExpr: T,
    variableTag: T,
    eof: T
};

function syntaxTreeLetrec<T>(
    builder: fc.LetrecTypedBuilder<
        T extends ASTTypeMap<unknown>? T : ASTTypeMap<T>
    >
) {
    return fc.letrec(builder);
}

/* Casting is necessary throughout this definition since the return type of 
`tie` is `fc.Arbitrary<unknown>` */
export const wellFormedTokensArb = syntaxTreeLetrec<Token[]>(
    (tie) => ({
        document: fc.tuple(tie('textExpr'), getTokenArb('eof')).map(
            ([text, eof]) => [...(text as Token[]), eof]
        ),

        textExpr: fc.option(fc.tuple(
            /* The text token arb is wrapped in a singleton tuple so that spread 
            syntax is supported in both cases. */
            fc.oneof(fc.tuple(getTokenArb('text')), tie('variableTag')), 
            tie('textExpr'))
        ).map((pair) => {
            if (pair) {
                const [content, tail] = pair;
                return [...(content as Token[]), ...(tail as Token[])];
            }
            return [];
        }),

        variableTag: fc.tuple(...getTokenArbs(
            'tagOpen', 'identifier', 'tagClose'
        )),

        eof: fc.constant([] as Token[])
    })
).document;

export const syntaxTreeArbs = syntaxTreeLetrec<{
    document: syn.TinDoc,
    textExpr: syn.TextExpr,
    variableTag: syn.VariableTag,
    eof: syn.EOF
}>(
    (tie) => ({
        document: fc.option(
            tie('textExpr'),
            { nil: undefined }
        ).map((body) => syn.TinDoc.makeTestNode(body)),

        textExpr: fc.tuple(
            fc.oneof(tie('variableTag') as fc.Arbitrary<syn.VariableTag>, fc.string()),
            fc.option(
                tie('textExpr') as fc.Arbitrary<syn.TextExpr>,
                { nil: undefined }
            )
        ).map(([content, tail]) => syn.TextExpr.makeTestNode(content, tail)),

        variableTag: fc.option(
            getTokenArb('identifier'),
            { nil: undefined }
        ).map((identifier) => syn.VariableTag.makeTestNode(identifier)),

        eof: fc.constant(syn.EOF.makeTestNode())
    })
)


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