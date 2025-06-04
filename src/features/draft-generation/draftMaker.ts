import { Draft } from './draft.ts';
import { TinDraftError } from '../../common/tinErrors.ts';
import { TinContext } from '../../common/intermediates.ts';
import { isNever } from '../../common/staticAssert.ts';
import { fold } from '../../common/transformations.ts';
import * as syn from '../../common/syntaxTree.ts';

const EMPTY_DRAFT: Draft = {content: '', errors: []};

export function makeDraft(root: syn.SyntaxTree, context: TinContext) {
    return fold<Draft>(
        root, 
        {content: '',errors: []},
        (r) => dispatchFill(r, context),
        (first, second) => ({
            content: first.content + second.content,
            errors: [...first.errors, ...second.errors]
        })
    );
}

function dispatchFill(node: syn.SyntaxTree, context: TinContext): Draft {
    switch(node.kind) {
        case 'textExpr':
            return fillFromTextExpr(node);
        case 'variableTag':
            return fillFromVariableTag(node, context);
        case 'tinDoc': // fall through
        case 'eof':
            return EMPTY_DRAFT;
        default:
            isNever(node);
    }
}

function fillFromTextExpr(
    textExpr: syn.TextExpr
): Draft {
    const content = textExpr.content;
    let result = '';
    switch(content.kind) {
        case 'string':
            result = content.payload;
            break;
        case 'variable':
            break;
        default:
            isNever(content);
    }
    return { content: result, errors: [] };
}

function fillFromVariableTag(
    variableTag: syn.VariableTag, 
    context: TinContext, 
): Draft {
    const draft = EMPTY_DRAFT;

    /* In this case no error is necessary since `variableTag` will already 
    have an error. */
    if (!variableTag.identifier) return EMPTY_DRAFT;
    const name = variableTag.identifier.lexeme;
    const variable = TinContext.tryGet(context, name);
    if (!variable) {
        draft.errors.push(TinDraftError.make(''));
        return draft;
    }
    if (variable.content === undefined) {
        draft.errors.push(TinDraftError.make(
            `A value is missing for variable "${name}".`
        ));
        return draft;
    }

    switch(variable.kind) {
        case 'boolean':
            draft.errors.push(TinDraftError.make(
                `Variable "${name})" cannot be written to the draft 
                    because it is a boolean.`
            ));
            break;
        case 'number':
            draft.content += variable.content.toString();
            break;
        case 'string':
            draft.content += variable.content;
            break;
        default:
            isNever(variable);
    }
    return draft;
}
