# Overview

This document is meant to provide some explanation for the conventions used in the TypeScript portion of this source.

## Fat-arrow syntax over method syntax
Fat-arrow syntax is preferred over method syntax in interfaces and types to avoid bivariant function typing. This convention provides more strict static typing, even with "--strictFunctionTypes" turned on. See [Typescript doc notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#note).

## Types over classes
Sum and product types are preferred over class hierarchies. For example, a datatype `Foo` with subtypes `Bar` and `Baz` is implemented as

```
export type Foo = FooCommon & FooDetail;
type FooCommon = {
    // Properties common to Bar and Baz...
};
type FooDetail = Bar | Baz;
type Bar = {
    kind: 'bar',
    // Properties specific to Bar...
};
type Baz = {
    kind: 'baz',
    // Properties specific to Baz...
};
```

instead of 

```
export class Foo {
    // Properties common to Bar and Baz...
};
class Bar extends Foo {
    // Properties specific to Bar...
};
class Baz extends Foo {
    // Properties specific to Baz...
};
```

Dispatching a function over subtypes is accomplished by `switch`ing over the discriminating tag `kind` rather than using virtual functions.

### Simpler reasoning about types
Whenever a class contains private members, TS types objects of the class nominally, but all typing elsewhere is structural. Mixing nominal and structural typing leads to cases that I don't fully understand. I suspect it may result in unintuitive behavior when working with static operators on types and helpers like those in `staticAssert.ts`.

Classes create an interface with the same name as the class. An object may implement the interface without extending the class, leading to unintuitive results from `instanceof`. 

### Better specification in "derived" types
Using algebraic data types allow us to specify all summand types comprehensively as opposed to TS classes which are always open for extension by a subclass. This allows for very strict specification of related types outside of the module of the ADT.  

With this approach, adding a new summand type to an ADT results in static errors in whichever modules need to act on each summand type. For example, adding a new `SyntaxTree` node type in `syntaxTree.ts` results in a static type error in `syntaxArbs.ts` until arbitraries are added for the new summand type.

### Tradeoffs

#### Awkward distributing over types
If subtypes are also exported, then the ADT cannot factor those properties out of each summand type. Then the type declaration for `Foo` above would turn into 

```
export type Foo = Bar | Baz;
type FooCommon = {
    // Properties common to Bar and Baz...
};
type FooDetail = Bar | Baz;
export type Bar = {
    kind: 'bar',
    // Properties specific to Bar...
} & FooCommon;
export type Baz = {
    kind: 'baz',
    // Properties specific to Baz...
} & FooCommon;
```

This sort of declaration is streamlined using mapped types and the `Extract` type utility. (See `syntaxTree.ts` for an example.) However, using mapped types in this way produces less readable type names in error messages, e.g. `...TextExprDetail & SyntaxTreeCommon...` instead of `TextExpr`. Type names in the source remain the same by simply exporting a type alias.

### Exceptions
Abstract classes are used when a type should be partially implemented for all objects extending it and there is no need to operate over all types extending the base type. The `Visitor` class is an example. In the process of refactoring it to a type, I found that much more boilerplate is necessary when using a type than when using a class. 

## Declaration merging between namespaces and types
The functions and types associated with a given type are defined under a namespace with the same name as original type. This allows us to use the familiar dot syntax to access these names as if they were static methods of a class or inner classes respectively. The benefits of the "Types over classes" section are preserved, but we can also "attach" functions to our types. 

This idea is suggested by the docs on [declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html). Modules, rather than namespaces, are used to encapsulate code as usual. 

### Tradeoffs
The functions in the merged namespace cannot satisfy another interface or type that calls for certain function members.

Static builder functions in a type's associated namespace can't use parameter property shorthand like class constructors can.
