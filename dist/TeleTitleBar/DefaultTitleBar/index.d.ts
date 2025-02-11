import "./style.scss";
import { SideEffectManager } from "side-effect-manager";
import type { TeleBoxState } from "../../TeleBox/typings";
import type { TeleTitleBar, TeleTitleBarConfig, TeleTitleBarEvent } from "../typings";
import type { ReadonlyVal } from "value-enhancer";
export declare type DefaultTitleBarButton = TeleTitleBarEvent & {
    readonly iconClassName: string;
    readonly isActive?: (state: TeleBoxState) => boolean;
};
export interface DefaultTitleBarConfig extends TeleTitleBarConfig {
    buttons?: ReadonlyArray<DefaultTitleBarButton>;
}
export declare class DefaultTitleBar implements TeleTitleBar {
    constructor({ readonly$, state$, title$, buttons, onEvent, onDragStart, namespace, boxId }: DefaultTitleBarConfig);
    readonly namespace: string;
    $titleBar: HTMLElement | undefined;
    $dragArea: HTMLElement;
    render(): HTMLElement;
    renderDragArea(): HTMLElement;
    dragHandle(): HTMLElement | undefined;
    wrapClassName(className: string): string;
    destroy(): void;
    onEvent?: TeleTitleBarConfig["onEvent"];
    onDragStart?: TeleTitleBarConfig["onDragStart"];
    protected readonly$: TeleTitleBarConfig["readonly$"];
    protected title$: ReadonlyVal<string>;
    protected buttons: ReadonlyArray<DefaultTitleBarButton>;
    protected state$: TeleTitleBarConfig["state$"];
    protected sideEffect: SideEffectManager;
    protected boxId: string;
    protected lastTitleBarClick: {
        timestamp: number;
        clientX: number;
        clientY: number;
    };
    protected handleTitleBarClick: (ev: PointerEvent) => void;
}
