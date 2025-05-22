import * as syn from '../../common/intermediates.ts';
import { Draft, DraftError } from './draft.ts';
import { TinContext } from '../../common/tinContext.ts';
import { PiecewiseVisitor } from '../../common/visitor.ts';

export default function makeDraft(
    root: syn.SyntaxTree, 
    context: TinContext
): Draft {
    const maker = new DraftMaker(context);
    return new Draft(maker.makeDraft(root), maker.errors);
}

class DraftMaker extends PiecewiseVisitor<string> {
    private m_errors: DraftError[] = [];

    public get errors(): readonly DraftError[] {
        return this.m_errors;
    }

    constructor (private context: TinContext) {
        super();
    }

    /**
     * Fill a template with entries from this draft maker's context.
     * 
     * @param root - The root of the AST representing the template to fill.
     * 
     * @returns A draft filled with entries from `this.context`.
     */
    public makeDraft(root: syn.SyntaxTree) {
        return this.visit(root);
    }

    /** @override */
    public visitTinDoc(document: syn.TinDoc): string {
        return this.visitTextExpr(document.content);
    }

    /** @override */
    public visitTextExpr(textExpr: syn.TextExpr): string {
        const content = textExpr.content;
        switch(content.kind) {
            case 'string':
                return content.payload;
            case 'variable':
                let varText = this.visitVariableTag(content.payload);
                if (textExpr.tail) 
                    return varText + this.visitTextExpr(textExpr.tail);
                return varText
        }
    }

    /** @override */
    public visitEOF(_: syn.EOF): string {
        return '';
    }

    /** @override */
    public visitVariableTag(variableTag: syn.VariableTag): string {
        const variable = this.context.tryGet(variableTag.identifier?.lexeme);
        if (!variable) {
            // TODO: DraftError here.
            return '';
        }
        switch(variable.kind) {
            case 'boolean':
                // TODO: DraftError here?
                return '';
            case 'number':
                return variable.content.toString();
            case 'string':
                return variable.content;
        }
    }
}
