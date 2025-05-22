import { fc } from '@fast-check/vitest';
import toPrettyString from '../../../common/test/prettyPrinter';
import { ParseResult } from './syntaxArbs';

export function syntaxTestFailReporter(out:fc.RunDetails<[ParseResult]>) {
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