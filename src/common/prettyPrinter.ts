import * as syn from './syntaxTree.ts';

const MARGIN_INCREMENT = 2;

export default function toPrettyString(root: syn.SyntaxTree): string {
    return syn.fold(
        root, 
        (node, depth) => formatLine(node.kind, depth * MARGIN_INCREMENT),
        (s, t) => s + t
    );
}

function formatLine(s: string, marginWidth: number): string {
    return ' '.repeat(marginWidth) + s + '\n';
}
