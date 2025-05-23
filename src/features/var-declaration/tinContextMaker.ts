import { TinContext, TinValue } from './tinContext.ts';
import { SyntaxTree } from '../../common/intermediates.ts';
import { UniformVisitor } from '../../common/visitor.ts';
import { TinVariableError } from '../../common/tinErrors.ts';

export function makeTinContext(root: SyntaxTree): TinContext {
    const maker = new TinContextMaker();
    maker.visit(root);
    return maker.context;
}

class TinContextMaker extends UniformVisitor<void> {
    public readonly context: TinContext = new Map<string, TinValue>();

    /** @override */
    public visit(node: SyntaxTree): void {
        if (node.kind !== 'variableTag' || !node.identifier) return;
        if (TinContext.tryGet(this.context, node.identifier.lexeme)) {
            node.errors.push(TinVariableError.make(
                node.identifier, 
                `Variable ${node.identifier.lexeme} was already declared, but 
                    its declared again here.`
            ));
            return;
        }
        this.context.set(node.identifier.lexeme, TinValue.make(''));
    }
}
