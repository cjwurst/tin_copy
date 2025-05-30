import { SyntaxTree, TinContext } from '../../common/intermediates.ts';
import { fold } from '../../common/transformations.ts';
import { TinTypeError } from '../../common/tinErrors.ts';

export function checkTypes(root: SyntaxTree, context: TinContext): boolean {
    return fold<boolean>(root, true, (node) => checkNode(node, context), 
        (x, y) => x && y);
}

function checkNode(node: SyntaxTree, context: TinContext): boolean {
    return true;
}

