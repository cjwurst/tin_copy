import { TinContext, TinValue } from './tinContext.ts';
import { SyntaxTree } from '../../common/intermediates.ts';
import { TinVariableError } from '../../common/tinErrors.ts';

export function makeTinContext(root: SyntaxTree): TinContext {
    const context = new Map<string, TinValue>();
    addToContext(root, context)
    return context;
}

function addToContext(node: SyntaxTree, context: TinContext): void {
    if (node.kind == 'variableTag' && node.identifier) {
        if (TinContext.tryGet(context, node.identifier.lexeme)) {
            node.errors.push(TinVariableError.make(
                node.identifier, 
                `Variable ${node.identifier.lexeme} was already declared, but 
                    its declared again here.`
            ));
        } else {
            context.set(node.identifier.lexeme, TinValue.make(undefined));
        }
    }
    for(let i = 0; i < node.children.length; i++) {
        addToContext(node.children[i], context);
    }
}
