import * as syn from './syntaxTree';

type ErrorReport = {
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
        for (let i = 0; i < errors.length; i++) {
            this.report.message += errors[i].message + '\n';
        }
        this.report.count += errors.length;
        node.acceptToChildren(this);
    }
}