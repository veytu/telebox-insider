import "./style.scss";
import { SideEffectManager } from "side-effect-manager";
import type { ReadonlyVal, ValEnhancedResult, ReadonlyValEnhancedResult } from "value-enhancer";
import { Val } from "value-enhancer";
import Emittery from "emittery";
import type { ReadonlyTeleBox, TeleBoxColorScheme, TeleBoxRect, TeleBoxState } from "../TeleBox";
import { TeleBox } from "../TeleBox";
import { TeleBoxCollector } from "../TeleBoxCollector";
import type { TeleBoxManagerConfig, TeleBoxManagerCreateConfig, TeleBoxFullscreen, TeleBoxManagerQueryConfig, TeleBoxManagerThemeConfig, TeleBoxManagerUpdateConfig } from "./typings";
import { MaxTitleBar } from "./MaxTitleBar";
export * from "./typings";
export * from "./constants";
declare type ReadonlyValConfig = {
    darkMode: ReadonlyVal<boolean, boolean>;
    state: ReadonlyVal<TeleBoxState, boolean>;
    root: Val<HTMLElement | null>;
    rootRect: Val<TeleBoxRect>;
    stageRect: ReadonlyVal<TeleBoxRect>;
    minimized: ReadonlyVal<boolean, boolean>;
    maximized: ReadonlyVal<boolean, boolean>;
};
declare type ValConfig = {
    fullscreen: Val<TeleBoxFullscreen>;
    prefersColorScheme: Val<TeleBoxColorScheme, boolean>;
    readonly: Val<boolean, boolean>;
    fence: Val<boolean, boolean>;
    stageRatio: Val<number, boolean>;
    containerStyle: Val<string>;
    stageStyle: Val<string>;
    defaultBoxBodyStyle: Val<string | null>;
    defaultBoxStageStyle: Val<string | null>;
    theme: Val<TeleBoxManagerThemeConfig | null>;
};
declare type CombinedValEnhancedResult = ValEnhancedResult<ValConfig> & ReadonlyValEnhancedResult<ReadonlyValConfig>;
export interface TeleBoxManager extends CombinedValEnhancedResult {
}
export declare class TeleBoxManager {
    constructor({ root, fullscreen, prefersColorScheme, minimized, maximized, normalBoxes, fence, collector, namespace, readonly, stageRatio, containerStyle, stageStyle, defaultBoxBodyStyle, defaultBoxStageStyle, theme, }?: TeleBoxManagerConfig);
    readonly $container: HTMLDivElement;
    readonly $stage: HTMLDivElement;
    get boxes(): ReadonlyArray<TeleBox>;
    get topBox(): TeleBox | undefined;
    readonly events: Emittery<{
        focused: ReadonlyTeleBox | undefined;
        blurred: ReadonlyTeleBox | undefined;
        created: ReadonlyTeleBox;
        removed: ReadonlyTeleBox[];
        state: "normal" | "minimized" | "maximized";
        maximized: boolean;
        minimized: boolean;
        move: ReadonlyTeleBox;
        resize: ReadonlyTeleBox;
        intrinsic_move: ReadonlyTeleBox;
        intrinsic_resize: ReadonlyTeleBox;
        visual_resize: ReadonlyTeleBox;
        z_index: ReadonlyTeleBox;
        prefers_color_scheme: "light" | "dark" | "auto";
        dark_mode: boolean;
    }, {
        focused: ReadonlyTeleBox | undefined;
        blurred: ReadonlyTeleBox | undefined;
        created: ReadonlyTeleBox;
        removed: ReadonlyTeleBox[];
        state: "normal" | "minimized" | "maximized";
        maximized: boolean;
        minimized: boolean;
        move: ReadonlyTeleBox;
        resize: ReadonlyTeleBox;
        intrinsic_move: ReadonlyTeleBox;
        intrinsic_resize: ReadonlyTeleBox;
        visual_resize: ReadonlyTeleBox;
        z_index: ReadonlyTeleBox;
        prefers_color_scheme: "light" | "dark" | "auto";
        dark_mode: boolean;
    }, never>;
    protected _sideEffect: SideEffectManager;
    readonly namespace: string;
    setMinimized: (minimized: boolean, skipUpdate?: boolean) => void;
    setMaximized: (maximized: boolean, skipUpdate?: boolean) => void;
    setNormalboxes: (normalBoxes: string[]) => void;
    /** @deprecated use setMaximized and setMinimized instead */
    setState(state: TeleBoxState, skipUpdate?: boolean): this;
    create(config?: TeleBoxManagerCreateConfig, smartPosition?: boolean): ReadonlyTeleBox;
    query(config?: TeleBoxManagerQueryConfig): ReadonlyTeleBox[];
    queryOne(config?: TeleBoxManagerQueryConfig): ReadonlyTeleBox | undefined;
    update(boxID: string, config: TeleBoxManagerUpdateConfig, skipUpdate?: boolean): void;
    updateAll(config: TeleBoxManagerUpdateConfig, skipUpdate?: boolean): void;
    remove(boxOrID: string | TeleBox, skipUpdate?: boolean): ReadonlyTeleBox | undefined;
    removeTopBox(): ReadonlyTeleBox | undefined;
    removeAll(skipUpdate?: boolean): ReadonlyTeleBox[];
    /**
     * Mount manager to a container element.
     */
    mount(root: HTMLElement): void;
    /**
     * Unmount manager from the container element.
     */
    unmount(): void;
    destroy(skipUpdate?: boolean): void;
    wrapClassName(className: string): string;
    focusBox(boxOrID: string | TeleBox, skipUpdate?: boolean): void;
    focusTopBox(): void;
    blurBox(boxOrID: string | TeleBox, skipUpdate?: boolean): void;
    blurAll(skipUpdate?: boolean): void;
    collector: TeleBoxCollector;
    titleBar: MaxTitleBar;
    protected normalBoxes: Val<string[]>;
    protected boxes$: Val<TeleBox[]>;
    protected topBox$: Val<TeleBox | undefined>;
    protected teleBoxMatcher(config: TeleBoxManagerQueryConfig): (box: TeleBox) => boolean;
    protected updateBox(box: TeleBox, config: TeleBoxManagerUpdateConfig, skipUpdate?: boolean): void;
    /** Keep new boxes staggered inside stage area */
    protected smartPosition(rect: Partial<TeleBoxRect>): TeleBoxRect;
    protected makeBoxTop(box: TeleBox, skipUpdate?: boolean): void;
    protected getBoxIndex(boxOrID: TeleBox | string): number;
    protected getBox(boxOrID: TeleBox | string): TeleBox | undefined;
}
