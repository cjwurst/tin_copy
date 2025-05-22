import { Token } from '../../common/intermediates.ts';
import { TinError } from '../tin-errors/tinError';
import { staticAssert } from '../../common/staticAssert';

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

/* Assert that we didn't forget to intersect with `SyntaxTreeCommon` on any of 
our node types. */
staticAssert<SyntaxTree extends SyntaxTreeCommon? true: false>;

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
        tail: TextExpr | undefined
    ): TextExpr {
        const common = tail? makeCommon(tail) : makeCommon();
        return {
            ...common,
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
    export function make(identifier: Token | undefined): VariableTag {
        return {
            ...makeCommon(),
            kind: 'variableTag',
            identifier: identifier
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

/**
 * Fold over an AST from leaf to root.
 */
export function fold<T>(
    root: SyntaxTree, 
    initial: T,
    process: (r: SyntaxTree) => T,
    accumulate: (first: T, second: T) => T
): T {
    let result = initial;
    const childCount = root.children.length;
    for (let i = 0; i < childCount; i++) {
        result = accumulate(result, fold(root.children[i], result, process, accumulate));
    }
    return accumulate(process(root), result);
}

/** 
 * A collection of functions acting on the subtypes of `SyntaxTree` with 
 * optional readonly properties common to all functions.
 */
export type SyntaxTreeHandler<TReturn, TProps = never> = {
    // TODO: Define some intermediate types to make this declaration clearer.
    [TKind in NodeKind]: TProps extends never? ({ (
        node: NodeTypeByKind[TKind]
    ): TReturn }) : ({ (
        node: NodeTypeByKind[TKind], 
        props: TProps
    ): TReturn }) 
} & (TProps extends never? 
    { } : 
    { readonly props: TProps }
);

export function isGood(root: SyntaxTree): boolean {
    return root.errors.length == 0;
}

function makeCommon(...children: SyntaxTree[]): SyntaxTreeCommon {
    return {
        children: children,
        errors: []
    };
}