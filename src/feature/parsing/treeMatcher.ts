import * as syn from '../../syntaxTree';
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

// TODO: Change this to a UniformVisitor.
class TreeMatcher extends syn.PiecewiseVisitor<boolean> {
    private current: any;

    constructor(private readonly root: syn.SyntaxTree) {
        super();
        this.current = root;
    }

    public compare(other: syn.SyntaxTree): boolean {
        const matches = other.accept(this);
        this.current = this.root;
        return matches;
    }

    public visitTinDoc(document: syn.TinDoc): boolean {
        let matches: boolean = true;
        if (!(this.current instanceof syn.TinDoc)) {
            return false;
        }

        let content = this.current.content;
        let eof = this.current.eof;

        this.current = content;
        matches = matches && this.visitTextExpr(document.content);

        this.current = eof;
        matches = matches && this.visitEOF(document.eof);
        return matches;
    }

    public visitTextExpr(textExpr: syn.TextExpr): boolean {
        let matches = true;
        if (!(this.current instanceof syn.TextExpr)) 
            return false;

        let content = this.current.content;
        let tail = this.current.tail;

        if (textExpr.content instanceof syn.VariableTag) {
            this.current = content;
            matches = matches && this.visitVariableTag(textExpr.content);
        } else if (typeof content !== 'string')
            matches = false;

        if (textExpr.tail) {
            this.current = tail;
            matches = matches && this.visitTextExpr(textExpr.tail);
        } else if (content)
            matches = false;
            
        return matches;
    }

    public visitEOF(_: syn.EOF): boolean {
        return this.current instanceof syn.EOF;
    }

    public visitVariableTag(variableTag: syn.VariableTag): boolean {
        if (!(this.current instanceof syn.VariableTag))
            return false;

        if (
            variableTag.identifier instanceof Token != 
                this.current.identifier instanceof Token
        )
            return false;

        return true;
    }

}