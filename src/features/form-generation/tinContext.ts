import { isNever } from "../../common/staticAssert";

export type TinContext = Map<string, TinValue>;

export namespace TinContext {
    export function make() {
        return new Map<string, TinValue>();
    }

    export function tryGet(
        context: TinContext, 
        name: string | undefined
    ): TinValue | undefined {
        return name? context.get(name) : undefined;
    }
}

export type TinValue = 
    | TinString
    | TinBoolean
    | TinNumber;

export namespace TinValue {
    export function make(x: boolean | number | string): TinValue {
        switch(typeof x) {
            case 'boolean':
                return {
                    kind: 'boolean',
                    content: x
                };
            case 'number':
                return {
                    kind: 'number',
                    content: x
                };
            case 'string':
                return {
                    kind: 'string',
                    content: x
                };
            default:
                isNever(x);
        }
    }
}

type TinString = {
    kind: 'string',
    content: string
}

type TinBoolean = {
    kind: 'boolean',
    content: boolean
}

type TinNumber = {
    kind: 'number',
    content: number
}