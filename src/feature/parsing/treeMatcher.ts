import * as syn from './syntaxTree';
import { Token } from '../lexing/scanner';

/**
 * Check if two syntax trees match in their recursive type structure.
 */
export default function structuresMatch(
    root1: syn.SyntaxTree, 
    root2: syn.SyntaxTree
) {
    let matcher = new TreeMatcher(root1);
    return matcher.compare(root2);
}

class TreeMatcher extends syn.Visitor {
    private current: any;
    private matches: boolean = true;

    constructor(private readonly root: syn.SyntaxTree) {
        super();
        this.current = root;
    }

    public compare(other: syn.SyntaxTree): boolean {
        this.matches = true;
        other.accept(this);
        this.current = this.root;
        return this.matches;
    }

    public visitTinDoc(document: syn.TinDoc): void {
        if (!(this.current instanceof syn.TinDoc)) {
            this.matches = false;
            return;
        }

        let content = this.current.content;
        let eof = this.current.eof;

        this.current = content;
        this.visitTextExpr(document.content);

        this.current = eof;
        this.visitEOF(document.eof);
    }

    public visitTextExpr(textExpr: syn.TextExpr): void {
        if (!(this.current instanceof syn.TextExpr)) {
            this.matches = false;
            return;
        }

        let content = this.current.content;
        let tail = this.current.tail;

        if (textExpr.content instanceof syn.VariableTag) {
            this.current = content;
            this.visitVariableTag(textExpr.content);
        } else if (typeof content !== 'string') {
            this.matches = false;
            return;
        }

        if (textExpr.tail) {
            this.current = tail;
            this.visitTextExpr(textExpr.tail);
        } else if (content) {
            this.matches = false;
            return;
        }
    }

    public visitEOF(_: syn.EOF): void {
        if (!(this.current instanceof syn.EOF)) this.matches = false;
    }

    public visitVariableTag(variableTag: syn.VariableTag): void {
        if (!(this.current instanceof syn.VariableTag)) {
            this.matches = false;
            return;
        }

        if (
            variableTag.identifier instanceof Token != 
                this.current.identifier instanceof Token
        ) {
            this.matches = false;
            return;
        }
    }

}