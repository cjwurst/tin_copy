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
            + " " + this.lexeme 
            + " at " + this.line 
            + ":" + this.iChar;
    }
}

class Scanner {
    private tokens: Token[] = [];
    private i: number = 0;          // Current index
    private iToken: number = 0;     // Start of current token
    private iChar: number = 0;      // Index from last new line
    private line: number = 1;       // Current line

    private static keywords: Map<string, TokenKind>;

    static {
        this.keywords.set('if', TokenKind.If);
        this.keywords.set('else', TokenKind.Else);
        this.keywords.set('tin', TokenKind.Tin);
    }

    constructor(
        private source: string
    ) {}

    public getTokens(): Token[] {
        this.scanAll();
        return this.tokens;
    }

    private scanAll() {
        this.addToken(TokenKind.Text);
        while (!this.eof()) {
            if (this.peek() == '[' && this.peek(1) == '[') {
                this.addToken(TokenKind.Text);
                this.scanTag();
            }
            this.next();
        }
        this.addToken(TokenKind.Text);
        this.addToken(TokenKind.EOF);
    }

    private scanTag() {
        while (!this.eof()) {
            switch (this.next()) {
                case '~':
                    this.addToken(TokenKind.Tilde);
                    break;
                case ':':
                    this.addToken(TokenKind.Colon);
                    break;
                case ',':
                    this.addToken(TokenKind.Comma);
                    break;
                case '[':
                    if (this.match('[')) this.addToken(TokenKind.TagOpen);
                    else this.error("Expected '['");
                    break;
                case ']':
                    if (this.match(']')) {
                        this.addToken(TokenKind.TagClose);
                        return;
                    }
                    else this.error("Expected ']'");
                    break;
                default:
                    if (this.next(Scanner.isAlpha)) this.scanName();
                    else this.error("Unexpected character");
                    break;
            }
        }
    }

    private scanName() {
        while(this.next(Scanner.isAlphaNumeric));
        let name = this.source.substring(this.iToken, this.i);
        if (Scanner.keywords.has(name)) 
            this.addToken(Scanner.keywords.get(name) as TokenKind);
        else this.addToken(TokenKind.Identifier);
    }

    private match(char: string): boolean {
        return this.next((c: string) => c == char) !== null;
    }

    private next(
        predicate: (c: string) => boolean = (_: string) => true
    ): string | null {
        let char = this.peek();
        let matches = predicate(char);
        if (matches) {
            this.i++;
            this.iChar++;
        }
        return matches? char : null;
    }

    private eof(): boolean {
        return this.i >= this.source.length;
    } 

    private peek(ahead: number = 0): string {
        if (this.eof()) return '\0';
        return this.source.charAt(this.i + ahead);
    }

    private addToken(kind: TokenKind) {
        this.tokens.push(new Token(
            this.source.substring(this.iToken, this.i), 
            kind, 
            this.line, 
            this.iChar
        ));
        this.iToken = this.i;
    }

    private error(message: string) {
        console.log(message + ' at ' + this.line + ':' + this.iChar + '.');
    }

    private static isAlpha(c: string) {
        return /^[a-z]*$/i.test(c);
    }

    private static isAlphaNumeric(c: string) {
        return /^[a-z0-9]*$/i.test(c);
    }
}

export function scan(source: string): Token[] {
    return new Scanner(source).getTokens();
}