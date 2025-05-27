import * as syn from '../../common/intermediates.ts';
import { Draft } from './draft.ts';
import { TinDraftError } from '../../common/tinErrors.ts';
import { TinContext } from '../../common/intermediates.ts';
import { PiecewiseVisitor } from '../../common/visitor.ts';
import { isNever } from '../../common/staticAssert.ts';

export function makeDraft(
    root: syn.SyntaxTree, 
    context: TinContext
): Draft {
    const maker = new DraftMaker(context);
    const content = maker.makeDraft(root);
    return { content: content, errors: maker.errors };
}

class DraftMaker extends PiecewiseVisitor<string> {
    public readonly errors: TinDraftError[] = [];

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
        let result = '';
        switch(content.kind) {
            case 'string':
                result = content.payload;
                break;
            case 'variable':
                result = this.visitVariableTag(content.payload);
                break;
        }
        if (textExpr.tail) 
            result += this.visitTextExpr(textExpr.tail);
        return result;
    }

    /** @override */
    public visitEOF(_: syn.EOF): string {
        return '';
    }

    /** @override */
    public visitVariableTag(variableTag: syn.VariableTag): string {
        /* In this case no error is necessary since `variableTag` will already 
        have an error. */
        if (!variableTag.identifier) return '';
        const name = variableTag.identifier.lexeme;
        const variable = TinContext.tryGet(this.context, name);
        if (!variable) {
            this.errors.push(TinDraftError.make(
                ''
            ));
            return '';
        }
        switch(variable.kind) {
            case 'undefined':
                this.errors.push(TinDraftError.make(
                    `A value is missing for variable "${name}".`
                ));
                return '';
            case 'boolean':
                this.errors.push(TinDraftError.make(
                    `Variable "${name})" cannot be written to the draft 
                        because it is a boolean.`
                ));
                return '';
                // TODO: DraftError here?
                return '';
            case 'number':
                return variable.content.toString();
            case 'string':
                return variable.content;
            default:
                isNever(variable);
        }
    }
}
