import { TinError } from '../../common/tinErrors.ts';

export type Draft = {
    content: string,
    errors: TinError[]
}

export namespace Draft {
    export function isGood(draft: Draft): boolean {
        return draft.errors.length === 0;
    }
}