export type Draft = {
    readonly content: string,
    readonly errors: readonly DraftError[]
}

export namespace Draft {
    export function isGood(draft: Draft): boolean {
        return draft.errors.length === 0;
    }
}

export type DraftError = {
    message: string
}