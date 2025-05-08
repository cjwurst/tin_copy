import * as syn from '../../common/syntaxTree';
import { TinContext } from '../../common/tinContext';
import { PiecewiseVisitor } from '../../common/visitor';

export default function makeDraft(root: syn.SyntaxTree, context: TinContext) {
    return root.accept(new DraftMaker(context))
}

class DraftMaker extends PiecewiseVisitor<string> {
    constructor (private context: TinContext) {
        super();
    }

    /** @override */
    public visitTinDoc(document: syn.TinDoc): string {
        return this.visit(document.content);
    }

    /** @override */
    public visitTextExpr(textExpr: syn.TextExpr): string {
        return '';
    }

    /** @override */
    public visitEOF(eof: syn.EOF): string {
        return '';
    }

    /** @override */
    public visitVariableTag(variableTag: syn.VariableTag): string {
        return '';
    }
}

function concat(s: string, t: string): string {
    return s + t;
}
