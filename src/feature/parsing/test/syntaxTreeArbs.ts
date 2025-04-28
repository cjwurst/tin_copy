import { fc } from '@fast-check/vitest';
import { Token, TokenKind, TinSymbol } from '../../lexing/scanner';
import { badTokenArb, tokenArb } from '../../lexing/test/scannerArbs';
import * as syn from '../syntaxTree';
import { ErrorReport } from '../errorReporter';
import reportErrors from '../errorReporter';
import toPrettyString from '../prettyPrinter';

class ParseResult { 
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
    const root = syn.SyntaxTree.parseFromTokens(tokens.slice());
    return new ParseResult(tokens, root, reportErrors(root));
});

export function syntaxErrorReporter(out:fc.RunDetails<[ParseResult]>) {
    if (out.failed) {
        let message = '\n';
        if (out.counterexample) {
            const newLine = '\n';
            const [parseResult] = out.counterexample;
            message += newLine + parseResult.errorReport.count + 
                ' errors during parsing:' + newLine;
            message += parseResult.errorReport.message
                .split('\n')
                .map((e) => '  ' + e)
                .join(newLine);
            message += '\nAST:\n' + toPrettyString(parseResult.root);
        }
        throw new Error(fc.defaultReportMessage(out) + message);
    }
}

export function getTokenArb(kind: TokenKind): fc.Arbitrary<Token> {
    return tokenArb.get(kind)?? badTokenArb;
}

export function getTokenArbs(...kinds: TokenKind[]): fc.Arbitrary<Token>[] {
    return kinds.map((k) => getTokenArb(k));
}