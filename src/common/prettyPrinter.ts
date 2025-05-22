import { PiecewiseVisitor } from './visitor';
import * as syn from './syntaxTree'

export default function toPrettyString(root: syn.SyntaxTree): string {
    return new PrettyPrinter(root).toPrettyString();
}

const MARGIN_INCREMENT = 2;

// TODO: Change this to a PiecewiseVisitor of type 'string'.
class PrettyPrinter extends PiecewiseVisitor<void> {
    private result: string = '';

    private marginWidth: number = 0;

    constructor(
        private readonly root: syn.SyntaxTree
    ) { super(); }

    public toPrettyString(): string {
        this.result = '';
        this.marginWidth = 0;
        this.visit(this.root);
        return this.result;
    }

    /** @override */
    public visitTinDoc(document: syn.TinDoc): void {
        this.addLine('Tin Document:');
        this.indent();
        this.visit(document.content);
        this.visit(document.eof);
        this.unindent();
    }

    /** @override */
    public visitTextExpr(textExpr: syn.TextExpr): void {
        this.addLine('Text Expression:');
        this.indent();
        if (textExpr.content.kind === 'variable') 
            this.visit(textExpr.content.payload);
        else 
            this.addLine(textExpr.content.payload.length == 0? 
                '[empty string]' : textExpr.content.payload);
        if (textExpr.tail)
            this.visit(textExpr.tail);
        this.unindent();
    }

    /** @override */
    public visitEOF(_: syn.EOF): void {
        this.addLine('EOF');
    }

    /** @override */
    public visitVariableTag(variableTag: syn.VariableTag): void {
        this.addLine('Variable Tag:');
        this.indent();
        if (variableTag.identifier)
            this.addLine(variableTag.identifier.lexeme);
        this.unindent();
    }

    private indent(): void {
        this.marginWidth += MARGIN_INCREMENT;
    }

    private unindent(): void {
        this.marginWidth -= MARGIN_INCREMENT;
    }

    private addLine(s: string): void {
        this.result += ' '.repeat(this.marginWidth) + s + '\n';
    }
}