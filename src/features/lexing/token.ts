export enum TinSymbol {
    LeftBracket = '[',
    DoubleLeftBracket = '[[',
    RightBracket = ']',
    DoubleRightBracket = ']]',
    Tilde = '~',
    Colon = ':',
    Comma = ',',
    If = 'if',
    Else = 'else',
    Tin = 'tin'
};

export type TokenKind = TokenDetail['kind'];

export type Token = TokenDetail & TokenCommon;

type TokenCommon = {
    readonly lexeme: string,
    readonly iLine: number,
    readonly iChar: number
};

type TokenDetail =
    | { readonly kind: 'text' }
    | { readonly kind: 'tagOpen' }
    | { readonly kind: 'tagClose' }
    | { readonly kind: 'tilde' }
    | { readonly kind: 'colon' }
    | { readonly kind: 'comma' }
    | { readonly kind: 'if' }
    | { readonly kind: 'else' }
    | { readonly kind: 'tin' }
    | { readonly kind: 'identifier' }
    | { readonly kind: 'eof' }
    | { readonly kind: 'whitespace' }
    | { readonly kind: 'bad' };