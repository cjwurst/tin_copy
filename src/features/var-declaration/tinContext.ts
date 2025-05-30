import { isNever } from "../../common/staticAssert";

export type TinContext = Map<string, TinValue>;

export namespace TinContext {
    export function tryGet(
        context: TinContext, 
        name: string | undefined
    ): TinValue | undefined {
        return name? context.get(name) : undefined;
    }

    export function copyWithChange(
        context: TinContext, 
        name: string, 
        value: TinValue
    ) {
        const copy = new Map<string, TinValue>(context);
        copy.set(name, value);
        return copy;
    }
}

export type TinValue = 
    | TinString
    | TinBoolean
    | TinNumber;

export namespace TinValue {
    export function make(x: boolean | number | string | undefined): TinValue {
        if (x === undefined) return { kind: 'string', content: undefined };

        /* TODO: This switch statement only exists to narrow the type of `x` - 
        is there a better way to do this? Casting would work... */
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
    content: string | undefined
};

type TinBoolean = {
    kind: 'boolean',
    content: boolean | undefined
};

type TinNumber = {
    kind: 'number',
    content: number | undefined
};

