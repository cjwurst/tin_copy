export enum TokenKind {
    StringLiteral,
    TagOpen,
    TagClose,
    Identifier,
    EOF,
}

export class Token {
    constructor(
        readonly lexeme: string,
        readonly kind: TokenKind,
        readonly iLine: number,
        readonly iChar: number
    ) {}

    public toString(): string {
        return TokenKind[this.kind] 
            + this.lexeme 
            + " at " + this.iLine 
            + ":" + this.iChar;
    }
}

export function lex(raw: string): Token[] {
    const words: string[] = raw.split("|");
    let tokens: Token[] = [];
    for (let i = 0; i < words.length; i++) {
        tokens.push(new Token(words[i], TokenKind.StringLiteral, 0, 0));
    }
    return tokens;
}