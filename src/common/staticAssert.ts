/**
 * Assert that an arbitrary type expression evaluates to type `true`.
 * 
 * @example
 * // Passes type check
 * staticAssert<string extends string | number? true : false>;
 * 
 * // Fails type check
 * staticAssert<string | number extends string? true : false>;
 */
export function staticAssert<T extends true>(_: T) {}

/**
 * Assert that the argument passed has been narrowed to type `never`.
 */
export function isNever(_: never): never { throw new Error(); }