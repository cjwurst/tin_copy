import { Token } from '../../common/intermediates.ts';
import { TinError } from '../../common/tinErrors.ts';

type SyntaxTreeCommon = {
    readonly errors: TinError[],
    readonly children: readonly SyntaxTree[]
};

type SyntaxTreeDetail =
    | TinDocDetail
    | TextExprDetail
    | VariableTagDetail
    | EOFDetail;

export type NodeKind = SyntaxTreeDetail['kind'];

/* This will be used as a statically safe type-by-name dictionary rather than a
traditional type, so naming conventions are broken. */
export type NodeTypeByKind = {
    [TKind in SyntaxTreeDetail['kind']]: 
        Extract<SyntaxTreeDetail, { kind: TKind }> & SyntaxTreeCommon
};

export type SyntaxTree = NodeTypeByKind[SyntaxTreeDetail['kind']];

export type SyntaxTreeKind = SyntaxTree['kind']; 

type TinDocDetail = {
    readonly kind: 'tinDoc',
    readonly content: TextExpr;
    readonly eof: EOF;
};
export type TinDoc = NodeTypeByKind['tinDoc'];
export namespace TinDoc {
    export function make(content: TextExpr, eof: EOF = EOF.make()): TinDoc {
        return {
            ...makeCommon(content, eof),
            kind: 'tinDoc',
            content: content,
            eof: eof
        };
    }
};

type TextExprDetail = {
    readonly kind: 'textExpr',
    readonly content: TextExpr.Content,
    readonly tail: TextExpr | undefined
};
export type TextExpr = NodeTypeByKind['textExpr'];
export namespace TextExpr {
    export type Content = 
    | {
        readonly kind: 'string',
        readonly payload: string
    }
    | {
        readonly kind: 'variable',
        readonly payload: VariableTag
    };

    export function make(
        content: Content, 
        tail: TextExpr | undefined = undefined
    ): TextExpr {
        const children: SyntaxTree[] = [];
        if (tail) children.push(tail);
        if (content.kind === 'variable') children.push(content.payload);
        return {
            ...makeCommon(...children),
            kind: 'textExpr',
            content: content,
            tail: tail
        };
    }
}

type VariableTagDetail = {
    readonly kind: 'variableTag',
    readonly identifier: Token | undefined,
};
export type VariableTag = NodeTypeByKind['variableTag'];
export namespace VariableTag {
    export function make(identifier: Token | string | undefined): VariableTag {
        let identifierToken: Token | undefined;
        if (typeof identifier === 'string') {
            identifierToken = {
                kind: 'identifier',
                iChar: -1,
                iLine: -1,
                lexeme: identifier
            };
        } else 
            identifierToken = identifier;
        return {
            ...makeCommon(),
            kind: 'variableTag',
            identifier: identifierToken
        };
    }
}

type EOFDetail = {
    kind: 'eof'
};
export type EOF = NodeTypeByKind['eof'];
export namespace EOF {
    export function make(): EOF {
        return {
            ...makeCommon(),
            kind: 'eof'
        };
    }
}

export function isGood(root: SyntaxTree): boolean {
    return root.errors.length == 0;
}

/**
 * Fold over the AST in preorder.
 */
export function fold<T>(
    root: SyntaxTree, 
    process: ((r: SyntaxTree, depth: number) => T) | ((r: SyntaxTree) => T),
    accumulate: (first: T, second: T) => T
): T {
    return foldWithDepth<T>(root, process, accumulate);
}

export function foldWithDepth<T>(
    root: SyntaxTree, 
    process: (r: SyntaxTree, depth: number) => T,
    accumulate: (first: T, second: T) => T,
    depth: number = 0
): T {
    return root.children.map((child) => 
        foldWithDepth(child, process, accumulate, depth+1)
    ).reduce(accumulate, process(root, depth));
}

function makeCommon(...children: SyntaxTree[]): SyntaxTreeCommon {
    return {
        children: children,
        errors: []
    };
}
