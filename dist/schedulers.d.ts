export declare type AnyToVoidFunction = (...args: any[]) => void;
export declare type NoneToVoidFunction = () => void;
export declare type Scheduler = typeof requestAnimationFrame | typeof onTickEnd;
export declare function fastRaf(callback: NoneToVoidFunction, isPrimary?: boolean): void;
export declare function fastRafPrimary(callback: NoneToVoidFunction): void;
export declare function onTickEnd(callback: NoneToVoidFunction, isPrimary?: boolean): void;
export declare function onTickEndPrimary(callback: NoneToVoidFunction): void;
