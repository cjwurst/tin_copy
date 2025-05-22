export class Draft {
    constructor(
        public readonly content: string,
        public readonly errors: readonly DraftError[]
    ) { }

    public get isGood(): boolean {
        return this.errors.length === 0;
    }
}

export type DraftError = {
    message: string
}