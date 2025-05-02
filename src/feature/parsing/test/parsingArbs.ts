import { fc } from '@fast-check/vitest';
import * as syn from '../../../common/syntaxTree';
import toPrettyString from '../prettyPrinter';
import { wellFormedTokensArb } from '../../../common/test/syntaxArbs';
import reportErrors, { ErrorReport } from '../errorReporter';
import { Token } from '../../lexing/scanner';

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

export const wellFormedParseArb:fc.Arbitrary<ParseResult> = wellFormedTokensArb.map((tokens) => {
    const root = syn.SyntaxTree.parseFromTokens(tokens.slice());
    return new ParseResult(tokens, root, reportErrors(root));
});