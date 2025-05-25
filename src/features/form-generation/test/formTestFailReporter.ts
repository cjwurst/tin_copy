import { fc } from '@fast-check/vitest';
import { SyntaxTree } from '../../../common/intermediates.ts';
import toPrettyString from '../../../common/prettyPrinter.ts';

export function formTestFailReporter<T extends SyntaxTree>(out:fc.RunDetails<[T]>) {
    if (out.failed) {
        let message = '\n';
        if (out.counterexample) {
            message += '\nAST:\n' + toPrettyString(out.counterexample[0]);
        }
        throw new Error(fc.defaultReportMessage(out) + message);
    }
}