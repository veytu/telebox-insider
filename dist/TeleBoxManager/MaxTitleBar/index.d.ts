import "./style.scss";
import type { TeleBox } from "../../TeleBox";
import type { DefaultTitleBarConfig } from "../../TeleTitleBar";
import { DefaultTitleBar } from "../../TeleTitleBar";
import type { TeleBoxRect } from "../../TeleBox/typings";
import type { ReadonlyVal } from "value-enhancer";
export declare type MaxTitleBarTitle = Pick<TeleBox, "id" | "title">;
export interface MaxTitleBarConfig extends DefaultTitleBarConfig {
    darkMode$: ReadonlyVal<boolean>;
    boxes$: ReadonlyVal<TeleBox[]>;
    rootRect$: ReadonlyVal<TeleBoxRect>;
    root: HTMLElement;
}
export declare class MaxTitleBar extends DefaultTitleBar {
    constructor(config: MaxTitleBarConfig);
    focusBox(box?: TeleBox): void;
    render(): HTMLElement;
    destroy(): void;
    protected renderTitles(): HTMLElement;
    focusedBox: TeleBox | undefined;
    protected darkMode$: MaxTitleBarConfig["darkMode$"];
    protected boxes$: MaxTitleBarConfig["boxes$"];
    protected rootRect$: MaxTitleBarConfig["rootRect$"];
    protected $titles: HTMLElement | undefined;
}
