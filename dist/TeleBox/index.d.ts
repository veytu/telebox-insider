import "./style.scss";
import Emittery from "emittery";
import { SideEffectManager } from "side-effect-manager";
import type { ReadonlyVal, ReadonlyValEnhancedResult, ValEnhancedResult } from "value-enhancer";
import { Val } from "value-enhancer";
import type { TeleTitleBar } from "../TeleTitleBar";
import type { TeleBoxConfig, TeleBoxState, TeleBoxCoord, TeleBoxSize, TeleBoxRect, TeleBoxDelegateEventData } from "./typings";
export * from "./constants";
export * from "./typings";
declare type RequiredTeleBoxConfig = Required<TeleBoxConfig>;
declare type ValConfig = {
    title: Val<RequiredTeleBoxConfig["title"], boolean>;
    visible: Val<RequiredTeleBoxConfig["visible"], boolean>;
    resizable: Val<RequiredTeleBoxConfig["resizable"], boolean>;
    draggable: Val<RequiredTeleBoxConfig["draggable"], boolean>;
    boxRatio: Val<RequiredTeleBoxConfig["boxRatio"], boolean>;
    boxMinimized: Val<boolean | null, boolean>;
    boxMaximized: Val<boolean | null, boolean>;
    boxReadonly: Val<boolean | null, boolean>;
    stageRatio: Val<RequiredTeleBoxConfig["stageRatio"], boolean>;
    stageStyle: Val<RequiredTeleBoxConfig["stageStyle"], boolean>;
    bodyStyle: Val<RequiredTeleBoxConfig["bodyStyle"], boolean>;
};
declare type PropsValConfig = {
    darkMode: RequiredTeleBoxConfig["darkMode$"];
    fence: RequiredTeleBoxConfig["fence$"];
    rootRect: RequiredTeleBoxConfig["rootRect$"];
    managerMinimized: RequiredTeleBoxConfig["managerMinimized$"];
    managerMaximized: RequiredTeleBoxConfig["managerMaximized$"];
    managerReadonly: RequiredTeleBoxConfig["managerReadonly$"];
    managerStageRect: RequiredTeleBoxConfig["managerStageRect$"];
    managerStageRatio: RequiredTeleBoxConfig["managerStageRatio$"];
    defaultBoxStageStyle: RequiredTeleBoxConfig["defaultBoxStageStyle$"];
    defaultBoxBodyStyle: RequiredTeleBoxConfig["defaultBoxBodyStyle$"];
    collectorRect: RequiredTeleBoxConfig["collectorRect$"];
};
declare type MyReadonlyValConfig = {
    zIndex: Val<RequiredTeleBoxConfig["zIndex"], boolean>;
    focus: Val<RequiredTeleBoxConfig["focus"], boolean>;
    minimized: ReadonlyVal<boolean, boolean>;
    maximized: ReadonlyVal<boolean, boolean>;
    readonly: ReadonlyVal<boolean, boolean>;
    minSize: Val<TeleBoxSize, boolean>;
    intrinsicSize: Val<TeleBoxSize, boolean>;
    intrinsicCoord: Val<TeleBoxCoord, boolean>;
    pxMinSize: ReadonlyVal<TeleBoxSize, boolean>;
    pxIntrinsicSize: ReadonlyVal<TeleBoxSize, boolean>;
    pxIntrinsicCoord: ReadonlyVal<TeleBoxCoord, boolean>;
    state: ReadonlyVal<TeleBoxState, boolean>;
    bodyRect: Val<TeleBoxRect>;
    stageRect: ReadonlyVal<TeleBoxRect>;
};
declare type CombinedValEnhancedResult = ReadonlyValEnhancedResult<PropsValConfig & MyReadonlyValConfig> & ValEnhancedResult<ValConfig>;
export interface TeleBox extends CombinedValEnhancedResult {
}
export declare class TeleBox {
    constructor({ id, title, namespace, visible, width, height, minWidth, minHeight, x, y, resizable, draggable, boxRatio, focus, zIndex, stageRatio, enableShadowDOM, titleBar, content, stage, footer, styles, userStyles, bodyStyle, stageStyle, darkMode$, fence$, root, rootRect$, managerMinimized$, managerMaximized$, managerReadonly$, managerStageRect$, managerStageRatio$, defaultBoxBodyStyle$, defaultBoxStageStyle$, collectorRect$, }: TeleBoxConfig);
    readonly id: string;
    /** ClassName Prefix. For CSS styling. Default "telebox" */
    readonly namespace: string;
    /** Enable shadow DOM for box content. Default true. */
    readonly enableShadowDOM: boolean;
    readonly events: Emittery<{
        dark_mode: boolean;
        prefers_color_scheme: "light" | "dark" | "auto";
        close: undefined;
        focus: undefined;
        blur: undefined;
        intrinsic_move: {
            x: number;
            y: number;
        };
        intrinsic_resize: {
            width: number;
            height: number;
        };
        z_index: number;
        state: "normal" | "minimized" | "maximized";
        minimized: boolean;
        maximized: boolean;
        readonly: boolean;
        destroyed: undefined;
    }, {
        dark_mode: boolean;
        prefers_color_scheme: "light" | "dark" | "auto";
        close: undefined;
        focus: undefined;
        blur: undefined;
        intrinsic_move: {
            x: number;
            y: number;
        };
        intrinsic_resize: {
            width: number;
            height: number;
        };
        z_index: number;
        state: "normal" | "minimized" | "maximized";
        minimized: boolean;
        maximized: boolean;
        readonly: boolean;
        destroyed: undefined;
    }, "close" | "focus" | "blur" | "destroyed">;
    readonly _delegateEvents: Emittery<TeleBoxDelegateEventData, {
        close: undefined;
        maximize: undefined;
        minimize: undefined;
    }, {
        close: undefined;
        maximize: undefined;
        minimize: undefined;
    }>;
    protected _sideEffect: SideEffectManager;
    titleBar: TeleTitleBar;
    /** Minimum box width relative to stage area. 0~1. Default 0. */
    get minWidth(): number;
    /** Minimum box height relative to stage area. 0~1. Default 0. */
    get minHeight(): number;
    /**
     * @param minWidth Minimum box width relative to stage area. 0~1.
     * @returns this
     */
    setMinWidth(minWidth: number, skipUpdate?: boolean): void;
    /**
     * @param minHeight Minimum box height relative to container element. 0~1.
     * @returns this
     */
    setMinHeight(minHeight: number, skipUpdate?: boolean): void;
    /**
     * Resize box.
     * @param width Box width relative to container element. 0~1.
     * @param height Box height relative to container element. 0~1.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    resize(width: number, height: number, skipUpdate?: boolean): void;
    /** Intrinsic box x position relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    get intrinsicX(): number;
    /** Intrinsic box y position relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    get intrinsicY(): number;
    /** Intrinsic box width relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    get intrinsicWidth(): number;
    /** Intrinsic box height relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    get intrinsicHeight(): number;
    /**
     * Move box position.
     * @param x x position in px.
     * @param y y position in px.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    protected move(x: number, y: number, skipUpdate?: boolean): void;
    /**
     * Resize + Move, with respect to fixed ratio.
     * @param x x position in px.
     * @param y y position in px.
     * @param width Box width in px.
     * @param height Box height in px.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    protected transform(x: number, y: number, width: number, height: number, skipUpdate?: boolean): void;
    private $authorContent?;
    /** Mount dom to box content. */
    mountContent(content: HTMLElement): void;
    /**  Unmount content from the box. */
    unmountContent(): void;
    private $authorStage?;
    /** Mount dom to box stage. */
    mountStage(stage: HTMLElement): void;
    /** Unmount content from the box. */
    unmountStage(): void;
    private $authorFooter?;
    /** Mount dom to box Footer. */
    mountFooter(footer: HTMLElement): void;
    /** Unmount Footer from the box. */
    unmountFooter(): void;
    /** Mount styles for box content */
    mountStyles(styles: string): void;
    /** Umount styles for box content */
    unmountStyles(): void;
    /** Mount user styles for box content */
    mountUserStyles(styles: string): void;
    /** Umount user styles for box content */
    unmountUserStyles(): void;
    /** DOM of the box */
    $box: HTMLElement;
    /** DOM of main area of the box. Including $body and $footer. */
    $main: HTMLElement;
    /** DOM of the box body */
    $body: HTMLElement;
    /** DOM of the box content container inside box body */
    $content: HTMLElement;
    /** DOM of the box stage area inside box body */
    $stage?: HTMLElement;
    /** DOM of custom box content styles */
    $styles: HTMLStyleElement;
    /** DOM of end user custom box content styles */
    $userStyles: HTMLStyleElement;
    /** DOM of the box title bar container */
    $titleBar: HTMLElement;
    /** DOM of the box footer container */
    $footer: HTMLElement;
    private _render;
    private _renderStage;
    private _handleTrackStart?;
    handleTrackStart: (ev: PointerEvent) => void;
    private _renderResizeHandlers;
    destroy(): Promise<void>;
    /**
     * Wrap a className with namespace
     */
    wrapClassName(className: string): string;
}
declare type PropKeys<K = keyof TeleBox> = K extends keyof TeleBox ? TeleBox[K] extends Function ? never : K : never;
export declare type ReadonlyTeleBox = Pick<TeleBox, PropKeys | "wrapClassName" | "mountContent" | "unmountContent" | "mountFooter" | "unmountFooter" | "mountStage" | "unmountStage" | "mountStyles" | "unmountStyles" | "setTitle" | "setDraggable" | "setResizable" | "setVisible" | "setBoxRatio" | "setStageRatio" | "setStageStyle" | "setBodyStyle" | "handleTrackStart" | "onValChanged">;
