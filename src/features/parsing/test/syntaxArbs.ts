import { fc } from '@fast-check/vitest';
import { Token, TokenKind } from '../../../common/intermediates.ts';
import { badTokenArb, tokenArb } from '../../lexing/test/tokenArbs.ts';
import * as syn from '../../../common/intermediates.ts';
import { parse } from '../parser';
import { reportErrors, ErrorReport } from '../../../common/tinErrors.ts';

type ParseResult = { 
    tokens: Token[],
    root: syn.SyntaxTree,
    errorReport: ErrorReport
};

type ASTTypeMap<T> = { [_ in syn.SyntaxTreeKind]: T };

function syntaxTreeLetrec<T extends ASTTypeMap<unknown>>(
    builder: fc.LetrecTypedBuilder<T>
) {
    return fc.letrec(builder);
}

export const wellFormedTokensArbs = syntaxTreeLetrec<ASTTypeMap<Token[]>>(
    (tie) => ({
        tinDoc: fc.tuple(tie('textExpr'), getTokenArb('eof')).map(
            ([text, eof]) => [...(text as Token[]), eof]
        ),

        textExpr: fc.option(fc.tuple(
            /* The text token arb is wrapped in a singleton tuple so that spread 
            syntax is supported in both cases. */
            fc.oneof(fc.tuple(getTokenArb('text')), tie('variableTag')), 
            tie('textExpr'))
        ).map((pair) => {
            if (pair) {
                const [content, tail] = pair;
                return [...(content as Token[]), ...(tail as Token[])];
            }
            return [];
        }),

        variableTag: fc.tuple(...getTokenArbs(
            'tagOpen', 'identifier', 'tagClose'
        )),

        eof: fc.constant([] as Token[])
    })
);

export const wellFormedParseArb: fc.Arbitrary<ParseResult> = 
    wellFormedTokensArbs.tinDoc.map((tokens) => {
        const root = parse(tokens.slice());
        return {
            tokens: tokens, 
            root: root, 
            errorReport: reportErrors(root)
        };
    }
);

/* Define these here to add a type check on the `content` of the `textExpr` 
letrec field below. */
type TextExprContentBuilder = (tie: fc.LetrecTypedTie<syn.NodeTypeByKind>) => 
    fc.Arbitrary<syn.TextExpr.Content>;
const VARIABLE_KIND: syn.TextExpr.Content['kind'] = 'variable';
const STRING_KIND: syn.TextExpr.Content['kind'] = 'string';
const buildTextExprContentArb: TextExprContentBuilder = (tie) => fc.oneof(
    tie('variableTag').map((v) => ({ kind: VARIABLE_KIND, payload: v })),
    fc.string().map((s) => ({ kind: STRING_KIND, payload: s }))
);

/*TODO: Figure out why this casts `VARIABLE_KIND` from type '"variable"' to 
type 'string', resulting in a type error. A workaround is given above with an
explicit type tag. */
// type TextExprContentBuilder = (tie: fc.LetrecTypedTie<syn.NodeTypeByKind>) => 
//     fc.Arbitrary<syn.TextExpr.Content>;
// const VARIABLE_KIND = 'variable';
// const STRING_KIND = 'string';
// const buildTextExprContentArb: TextExprContentBuilder = (tie) => fc.oneof(
//     tie('variableTag').map((v) => ({ kind: VARIABLE_KIND, payload: v })),
//     fc.string().map((s) => ({ kind: STRING_KIND, payload: s }))
// );

export const syntaxTreeArbs = makeSyntaxTreeArbs();
export const wellFormedSyntaxTreeArbs = makeSyntaxTreeArbs(true);

// TODO: Add unmaps, maybe?
function makeSyntaxTreeArbs(
    wellFormed: boolean = false
): fc.LetrecValue<syn.NodeTypeByKind> {
    return syntaxTreeLetrec<syn.NodeTypeByKind>((tie) => ({
        tinDoc: tie('textExpr').map((body) => syn.TinDoc.make(body)),

        textExpr: fc.tuple(
            buildTextExprContentArb(tie),
            fc.option(
                tie('textExpr'),
                { nil: undefined }
            )
        ).map(([content, tail]) => syn.TextExpr.make(content, tail)),

        variableTag: (wellFormed? 
            getTokenArb('identifier') :
            fc.option(
                getTokenArb('identifier'),
                { nil: undefined }
            )
        ).map((identifier) => syn.VariableTag.make(identifier)),

        eof: fc.constant(syn.EOF.make())
    }));
}

export function getTokenArb(kind: TokenKind): fc.Arbitrary<Token> {
    return tokenArb.get(kind)?? badTokenArb;
}

export function getTokenArbs(...kinds: TokenKind[]): fc.Arbitrary<Token>[] {
    return kinds.map((k) => getTokenArb(k));
}