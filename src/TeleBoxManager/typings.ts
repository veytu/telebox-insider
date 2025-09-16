import type EventEmitter from "eventemitter3";
import type { TeleBoxColorScheme } from "..";
import type { ReadonlyTeleBox, TeleBoxState } from "../TeleBox";
import type { TeleBoxConfig } from "../TeleBox/typings";
import type { TeleBoxCollector } from "../TeleBoxCollector";
import type { TELE_BOX_MANAGER_EVENT } from "./constants";
import { TELE_BOX_STATE } from "../TeleBox/constants";

type StringStyleKeys<T = keyof CSSStyleDeclaration> =
    T extends keyof CSSStyleDeclaration
        ? CSSStyleDeclaration[T] extends string
            ? T
            : never
        : never;

export type TeleStyles = Partial<Pick<CSSStyleDeclaration, StringStyleKeys>>;

export interface TeleBoxManagerConfig
    extends Pick<
        TeleBoxConfig,
        | "prefersColorScheme"
        | "fence"
        | "containerRect"
        | "maximized"
        | "minimized"
        | "namespace"
        | "readonly"
    > {
    /** Element to mount boxes. */
    root?: HTMLElement;
    /** Where the minimized boxes go. */
    collector?: TeleBoxCollector;
    allBoxStatusInfo?: Record<string, TELE_BOX_STATE>;
    lastLastNotMinimizedBoxsStatus?: Record<string, TELE_BOX_STATE>;
    appReadonly?: boolean;
}

type TeleBoxManagerBoxConfigBaseProps =
    | "title"
    | "visible"
    | "width"
    | "height"
    | "minWidth"
    | "minHeight"
    | "x"
    | "y"
    | "resizable"
    | "draggable"
    | "fixRatio"
    | "zIndex"
    | "maximized"
    | "minimized";

export type TeleBoxManagerCreateConfig = Pick<
    TeleBoxConfig,
    | TeleBoxManagerBoxConfigBaseProps
    | "content"
    | "footer"
    | "id"
    | "focus"
    | "hasHeader"
>;

export type TeleBoxManagerQueryConfig = Pick<
    TeleBoxConfig,
    TeleBoxManagerBoxConfigBaseProps | "id" | "focus"
>;

export type TeleBoxManagerUpdateConfig = Pick<
    TeleBoxConfig,
    TeleBoxManagerBoxConfigBaseProps | "content" | "footer"
>;

type CheckTeleBoxManagerConfig<
    T extends Record<`${TELE_BOX_MANAGER_EVENT}`, any>
> = T;

export type TeleBoxManagerEventConfig = CheckTeleBoxManagerConfig<{
    focused: [ReadonlyTeleBox | undefined];
    blurred: [ReadonlyTeleBox | undefined];
    created: [ReadonlyTeleBox];
    removed: [ReadonlyTeleBox[]];
    state: [TeleBoxState];
    all_box_status_info: [Record<string, TELE_BOX_STATE>];
    last_last_not_minimized_boxs_status: [Record<string, TELE_BOX_STATE>];
    move: [ReadonlyTeleBox];
    resize: [ReadonlyTeleBox];
    intrinsic_move: [ReadonlyTeleBox];
    intrinsic_resize: [ReadonlyTeleBox];
    visual_resize: [ReadonlyTeleBox];
    z_index: [ReadonlyTeleBox];
    prefers_color_scheme: [TeleBoxColorScheme];
    dark_mode: [boolean];
    onScaleChange: [number];
    OpenMiniBox: [any];
    boxToMinimized: [
        { boxId: string; allBoxStatusInfo: Record<string, TELE_BOX_STATE> }
    ];
    boxToMaximized: [
        { boxId: string; allBoxStatusInfo: Record<string, TELE_BOX_STATE> }
    ];
    boxToNormal: [
        { boxId: string; allBoxStatusInfo: Record<string, TELE_BOX_STATE> }
    ];
}>;

export type TeleBoxManagerEvent = keyof TeleBoxManagerEventConfig;

export interface TeleBoxManagerEvents
    extends EventEmitter<TeleBoxManagerEvent> {
    on<U extends TeleBoxManagerEvent>(
        event: U,
        listener: (...value: TeleBoxManagerEventConfig[U]) => void
    ): this;
    once<U extends TeleBoxManagerEvent>(
        event: U,
        listener: (...value: TeleBoxManagerEventConfig[U]) => void
    ): this;
    addListener<U extends TeleBoxManagerEvent>(
        event: U,
        listener: (...value: TeleBoxManagerEventConfig[U]) => void
    ): this;
    emit<U extends TeleBoxManagerEvent>(
        event: U,
        ...value: TeleBoxManagerEventConfig[U]
    ): boolean;
}
