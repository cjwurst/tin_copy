export class TinContext {
    private varByName = new Map<string, TinValue>();

    public copyWithChange(name: string, value: TinValue): TinContext {
        let context = new TinContext();
        context.varByName = new Map<string, TinValue>([...this.varByName, [name, value]]);
        return context;
    }

    public tryGet(name: string): TinValue | undefined {
        return this.varByName.get(name);
    }
}

/**
 * A value that a TinCopy expression can take. 
 * 
 * @remarks
 * This is just a sum type with some helper functions.
 */
export class TinValue {
    public readonly content: string | boolean | number;

    constructor(content: string | boolean | number) {
        this.content = content;
    }

    public asString(): string {
        return <string>this.asType(typeof '');
    }

    public asBoolean(): boolean {
        return <boolean>this.asType(typeof true);
    }

    public asNumber(): number {
        return <number>this.asType(typeof 0);
    }

    private asType(typeName: string): string | boolean | number | undefined {
        return (typeof this.content == typeName)? this.content : undefined;
    }
}