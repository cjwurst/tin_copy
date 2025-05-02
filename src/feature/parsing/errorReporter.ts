import * as syn from '../../common/syntaxTree';

export type ErrorReport = {
    count: number,
    message: string
}

/**
 * Report syntax errors encountered during the parsing of a syntax tree.
 */
export default function reportErrors(root: syn.SyntaxTree): ErrorReport {
    const reporter = new ErrorReporter();
    root.accept(reporter);
    return reporter.report;
}

/* If we discover later that error reporting should branch differently than
parsing recovery, we can reimplement this class as a `syn.Visitor` and treat
each node based on its concrete type. */
class ErrorReporter extends syn.UniformVisitor {
    public report:ErrorReport = { count: 0, message: ''};

    /** @override */
    protected visit(node: syn.SyntaxTree): void {
        const errors = node.errors;
        if (errors.length > 0)
            this.report.message += errors
                .map((e) => e.message)
                .join('\n') + '\n';
        this.report.count += errors.length;
        node.acceptToChildren(this);
    }
}