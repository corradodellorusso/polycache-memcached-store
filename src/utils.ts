export const identity = <T>(input: T): T => input;

export const isCacheable = <T>(input: T): boolean => input !== null && input !== undefined;
