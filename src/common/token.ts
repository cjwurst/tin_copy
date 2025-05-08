export enum TokenKind {
    Text,
    StringLiteral,
    TagOpen,
    TagClose,
    Tilde,
    Colon,
    Comma,
    If,
    Else,
    Tin,
    Identifier,
    EOF,
    Whitespace,
    Bad
}

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
}

export class Token {
    constructor(
        readonly lexeme: string,
        readonly kind: TokenKind,
        readonly line: number,
        readonly iChar: number
    ) {}

    public toString(): string {
        return TokenKind[this.kind] 
            + " '" + this.lexeme + "'" 
            + " at " + this.line 
            + ":" + this.iChar;
    }
}