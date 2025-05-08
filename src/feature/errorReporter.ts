import * as syn from '../common/syntaxTree';
import { UniformVisitor } from '../common/visitor';

export type ErrorReport = {
    count: number,
    message: string
}

/**
 * Report syntax errors encountered during the parsing of a syntax tree.
 */
export default function reportErrors(root: syn.SyntaxTree): ErrorReport {
    return new ErrorReporter().reportOn(root);
}

/* If we discover later that error reporting should branch differently than
parsing recovery, we can reimplement this class as a `syn.Visitor` and treat
each node based on its concrete type. */
class ErrorReporter extends UniformVisitor<ErrorReport> {
    public reportOn(root: syn.SyntaxTree): ErrorReport {
        return root.acceptRecursive(
            this, 
            { count: 0, message: ''}, 
            combineReports
        );
    }

    /** @override */
    protected visit(node: syn.SyntaxTree): ErrorReport {
        const errors = node.errors;
        let report = { count: 0, message: ''};
        if (errors.length > 0)
            report.message += errors
                .map((e) => e.message)
                .join('\n') + '\n';
        report.count += errors.length;
        return report;
    }
}

function combineReports(first: ErrorReport, second: ErrorReport) {
    return {
        count: first.count + second.count,
        message: first.message + second.message
    };
}