import * as Syn from './syntaxTree'

export function toPrettyString(root: Syn.SyntaxTree): string {
    return new PrettyPrinter(root).toPrettyString();
}

class PrettyPrinter extends Syn.Visitor {
    /* This is a member rather than a return value to conform to the interface 
    of `Syn.Visitor`. */
    private result: string = '';

    private marginWidth: number = 0;
    private readonly marginIncrement = 4;

    constructor(
        private readonly root: Syn.SyntaxTree
    ) { super(); }

    public toPrettyString(): string {
        this.result = '';
        this.marginWidth = 0;
        this.root.accept(this);
        return this.result;
    }

    /** @override */
    public visitTinDoc(document: Syn.TinDoc): void {
        this.addLine('Tin Document:');
        this.indent();
        this.visit(document.content);
        this.visit(document.eof);
        this.unindent();
    }

    /** @override */
    public visitTextExpr(textExpr: Syn.TextExpr): void {

    }

    /** @override */
    public visitEOF(eof: Syn.EOF): void {

    }

    /** @override */
    public visitVariableTag(varaibleTag: Syn.VariableTag): void {

    }

    private indent(): void {
        this.marginWidth += this.marginIncrement;
    }

    private unindent(): void {
        this.marginWidth -= this.marginIncrement;
    }

    private addLine(s: string): void {
        this.result += ' '.repeat(this.marginWidth) + s + '\n';
    }
}