import * as syn from './syntaxTree';

/**
 * Report syntax errors encountered during the parsing of a syntax tree.
 */
export default function reportErrors(root: syn.SyntaxTree): string {
    const reporter = new ErrorReporter();
    root.accept(reporter);
    return reporter.result;
}

/* If we discover later that error reporting should branch differently than
parsing recovery, we can reimplement this class as a `syn.Visitor` and treat
each node based on its concrete type. */
class ErrorReporter extends syn.UniformVisitor {
    public result: string = '';

    /** @override */
    protected visit(node: syn.SyntaxTree): void {
        const errors = node.errors;
        for (let i = 0; i < errors.length; i++) {
            this.result += errors[i].message + '\n';
        }
        node.acceptToChildren(this);
    }
}