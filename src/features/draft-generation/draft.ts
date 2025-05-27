import { TinError } from '../../common/tinErrors.ts';

export type Draft = {
    readonly content: string,
    readonly errors: readonly TinError[]
}

export namespace Draft {
    export function isGood(draft: Draft): boolean {
        return draft.errors.length === 0;
    }
}