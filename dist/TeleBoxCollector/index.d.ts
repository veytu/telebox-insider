import "./style.scss";
import type { TeleStyles } from "../typings";
import type { ReadonlyVal, ReadonlyValEnhancedResult, ValEnhancedResult } from "value-enhancer";
import { Val } from "value-enhancer";
import { SideEffectManager } from "side-effect-manager";
import type { TeleBoxRect } from "../TeleBox/typings";
export interface TeleBoxCollectorConfig {
    namespace?: string;
    styles?: TeleStyles;
    root: HTMLElement;
    minimized$: ReadonlyVal<boolean>;
    readonly$: ReadonlyVal<boolean>;
    darkMode$: ReadonlyVal<boolean>;
    boxCount: ReadonlyVal<number>;
    onClick?: () => void;
}
declare type ValConfig = {
    styles: Val<TeleStyles>;
    $collector: Val<HTMLElement>;
};
declare type MyReadonlyValConfig = {
    rect: ReadonlyVal<TeleBoxRect | undefined>;
    visible: ReadonlyVal<boolean>;
};
declare type CombinedValEnhancedResult = ValEnhancedResult<ValConfig> & ReadonlyValEnhancedResult<MyReadonlyValConfig>;
export interface TeleBoxCollector extends CombinedValEnhancedResult {
}
export declare class TeleBoxCollector {
    constructor({ minimized$, readonly$, darkMode$, boxCount, namespace, styles, root, onClick, }: TeleBoxCollectorConfig);
    readonly namespace: string;
    protected readonly _sideEffect: SideEffectManager;
    destroy(): void;
    wrapClassName(className: string): string;
}
export {};
