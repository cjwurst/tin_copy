export class TinContext {
    private valueByName = new Map<string, TinValue>();

    public copyWithChange(name: string, value: TinValue): TinContext {
        let context = new TinContext();
        context.valueByName = new Map<string, TinValue>(
            [...this.valueByName, [name, value]]
        );
        return context;
    }

    public tryGet(name: string | undefined): TinValue | undefined {
        return name? this.valueByName.get(name) : undefined;
    }
}

export function makeTinValue(x: boolean | number | string): TinValue {
    switch(typeof x) {
        case typeof true:
            return {
                kind: 'boolean',
                content: <boolean>x
            }

        case typeof 1:
            return {
                kind: 'number',
                content: <number>x
            }

        case typeof '':
            return {
                kind: 'string',
                content: <string>x
            }

        default:
            throw new Error('Signature of `makeTinValue` malformed.');
    }
}

export type TinValue = 
    | TinString
    | TinBoolean
    | TinNumber

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