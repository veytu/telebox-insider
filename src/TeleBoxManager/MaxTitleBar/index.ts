import "./style.scss";

import type { TeleBox } from "../../TeleBox";
import { DefaultTitleBar } from "../../TeleTitleBar";
import type { DefaultTitleBarConfig } from "../../TeleTitleBar";
import { TELE_BOX_STATE } from "../../TeleBox/constants";
import type { TeleBoxRect, TeleBoxState } from "../../TeleBox/typings";

export type MaxTitleBarTeleBox = Pick<TeleBox, "id" | "title" | "readonly">;

export interface MaxTitleBarConfig extends DefaultTitleBarConfig {
    darkMode: boolean;
    boxes: TeleBox[];
    containerRect: TeleBoxRect;
    focusedBox?: TeleBox;
    allBoxStatusInfo: Record<string, TELE_BOX_STATE>;
}

export class MaxTitleBar extends DefaultTitleBar {
    public constructor(config: MaxTitleBarConfig) {
        super(config);

        this.boxes = config.boxes;
        this.focusedBox = config.focusedBox;
        this.containerRect = config.containerRect;
        this.darkMode = config.darkMode;
        this.allBoxStatusInfo = config.allBoxStatusInfo;
    }

    public focusBox(box?: TeleBox): void {
        if ((this.focusedBox && this.focusedBox === box) || !box?.hasHeader) {
            return;
        }

        console.log(
            "[TeleBox] TitleBar FocusBox Called",
            box?.id,
            this.focusedBox?.id,
            this.state
        );
        if (
            this.$titles &&
            (this.state === TELE_BOX_STATE.Maximized || this.hasMaximizedBox())
        ) {
            const { children } = this.$titles.firstElementChild as HTMLElement;
            for (let i = children.length - 1; i >= 0; i -= 1) {
                const $tab = children[i] as HTMLElement;
                const id = $tab.dataset?.teleBoxID;
                if (id) {
                    if (box && id === box.id) {
                        $tab.classList.toggle(
                            this.wrapClassName("titles-tab-focus"),
                            true
                        );
                    } else if (this.focusedBox && id === this.focusedBox.id) {
                        $tab.classList.toggle(
                            this.wrapClassName("titles-tab-focus"),
                            false
                        );
                    }
                }
            }
        }
        this.focusedBox = box;
    }

    private hasMaximizedBox(): boolean {
        return Object.entries(this.allBoxStatusInfo || {}).some(
            ([_, state]) => state === TELE_BOX_STATE.Maximized
        );
    }

    public setContainerRect(rect: TeleBoxRect): void {
        this.containerRect = rect;
        if (this.$titleBar) {
            const { x, y, width } = rect;
            this.$titleBar.style.transform = `translate(${x}px, ${y}px)`;
            this.$titleBar.style.width = width + "px";
        }
    }

    public setBoxes(boxes: TeleBox[]): void {
        this.boxes = boxes;
	if (this.$titleBar) {
            this.$titleBar.classList.toggle(
                this.wrapClassName("max-titlebar-maximized"),
                this.state === TELE_BOX_STATE.Maximized && boxes.length > 0
            );
        }
        this.updateTitles();
    }

    public setAllBoxStatusInfo(
        allBoxStatusInfo: Record<string, TELE_BOX_STATE>
    ): void {
        console.log(
            "[TeleBox] MaxTitleBar - setAllBoxStatusInfo",
            allBoxStatusInfo
        );
        this.allBoxStatusInfo = allBoxStatusInfo;
	//
	if (this.$titleBar) {
            this.$titleBar.classList.toggle(
                this.wrapClassName("max-titlebar-maximized"),
                this.state === TELE_BOX_STATE.Maximized && boxes.length > 0
            );
        }
        this.updateTitles();
    }

    public setState(state: TeleBoxState): void {
        super.setState(state);
        if (this.$titleBar) {
            this.$titleBar.classList.toggle(
                this.wrapClassName("max-titlebar-maximized"),
                state === TELE_BOX_STATE.Maximized && this.boxes.length > 0
            );
        }
        this.updateTitles();
    }

    public setReadonly(readonly: boolean): void {
        super.setReadonly(readonly);
        if (this.$titleBar) {
            this.$titleBar.classList.toggle(
                this.wrapClassName("readonly"),
                this.readonly
            );
        }
    }

    public setDarkMode(darkMode: boolean): void {
        if (darkMode !== this.darkMode) {
            this.darkMode = darkMode;
            if (this.$titleBar) {
                this.$titleBar.classList.toggle(
                    this.wrapClassName("color-scheme-dark"),
                    darkMode
                );
                this.$titleBar.classList.toggle(
                    this.wrapClassName("color-scheme-light"),
                    !darkMode
                );
            }
        }
    }

    public setIndexZ(zIndex: number): void {
        if (this.$titleBar) {
            this.$titleBar.style.zIndex = String(zIndex);
        }
    }

    public render(): HTMLElement {
        const $titleBar = super.render();

        const { x, y, width } = this.containerRect;
        $titleBar.style.transform = `translate(${x}px, ${y}px)`;
        $titleBar.style.width = width + "px";

        $titleBar.classList.add(this.wrapClassName("max-titlebar"));
        $titleBar.classList.toggle(
            this.wrapClassName("max-titlebar-maximized"),
            this.state === TELE_BOX_STATE.Maximized && this.boxes.length > 0
        );
        $titleBar.classList.toggle(
            this.wrapClassName("readonly"),
            this.readonly
        );
        $titleBar.classList.add(
            this.wrapClassName(
                this.darkMode ? "color-scheme-dark" : "color-scheme-light"
            )
        );

        const $titlesArea = document.createElement("div");
        $titlesArea.classList.add(this.wrapClassName("titles-area"));
        $titleBar.insertBefore($titlesArea, $titleBar.firstElementChild);

        this.updateTitles();

        return $titleBar;
    }

    public destroy(): void {
        super.destroy();
        this.$titles = void 0;
        this.boxes.length = 0;
        this.focusedBox = void 0;
    }

    public updateTitles(): void {
        const maximizedBoxes = Object.entries(this.allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Maximized)
            .map(([boxId, _]) => boxId);
        const minimizedBoxes = Object.entries(this.allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Minimized)
            .map(([boxId, _]) => boxId);
        this.$titleBar?.classList.toggle(
            this.wrapClassName("max-titlebar-active"),
            maximizedBoxes.length > 0 &&
                this.boxes.length > 0 &&
                maximizedBoxes.filter(
                    (boxId) => !minimizedBoxes.includes(boxId)
                ).length > 0
        );
        if (
            this.$titleBar &&
            maximizedBoxes.length > 0 &&
            this.boxes.length > 0 &&
            maximizedBoxes.filter((boxId) => !minimizedBoxes.includes(boxId))
                .length > 0
        ) {
            this.$titleBar.classList.toggle(
                this.wrapClassName("max-titlebar-single-title"),
                this.boxes.length === 1
            );
            if (this.boxes.length === 1) {
                this.setTitle(this.boxes[0].title);
                if (this.boxes[0].hasHeader === false) {
                    this.$titleBar.style.display = "none";
                } else {
                    this.$titleBar.style.display = "";
                }
            } else {
                this.$titleBar.replaceChild(
                    this.renderTitles(),
                    this.$titleBar.firstElementChild as HTMLElement
                );
            }
        }
    }

    protected renderTitles(): HTMLElement {
        this.$titles = document.createElement("div");
        this.$titles.className = this.wrapClassName("titles");
        this.$titles.addEventListener(
            "wheel",
            (ev) => {
                (ev.currentTarget as HTMLElement).scrollBy({
                    left: ev.deltaY > 0 ? 250 : -250,
                    behavior: "smooth"
                });
            },
            { passive: false }
        );

        const $content = document.createElement("div");
        $content.className = this.wrapClassName("titles-content");
        this.$titles.appendChild($content);

        const maximizedBoxes = Object.entries(this.allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Maximized)
            .map(([boxId, _]) => boxId);
        const minimizedBoxes = Object.entries(this.allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Minimized)
            .map(([boxId, _]) => boxId);

        const maxBoxes = this.boxes
            .filter((box) => maximizedBoxes.includes(box.id))
            .filter((box) => !minimizedBoxes.includes(box.id))
            .filter((box) => box.hasHeader);

        const noHeaderBoxes = this.boxes
            .filter((box) => maximizedBoxes.includes(box.id))
            .filter((box) => !minimizedBoxes.includes(box.id))
            .filter((box) => !box.hasHeader);

        if (this.$titleBar) {
            if (maxBoxes.length == 0 && noHeaderBoxes.length > 0) {
                this.$titleBar.style.display = "none";
            } else {
                this.$titleBar.style.display = "";
            }
        }

        maxBoxes.forEach((box) => {
            const $tab = document.createElement("button");
            $tab.className = this.wrapClassName("titles-tab");
            $tab.textContent = box.title;
            $tab.dataset.teleBoxID = box.id;
            $tab.dataset.teleTitleBarNoDblClick = "true";

            if (this.focusedBox && box.id === this.focusedBox.id) {
                $tab.classList.add(this.wrapClassName("titles-tab-focus"));
            }

            $content.appendChild($tab);
        });

        return this.$titles;
    }

    protected darkMode: boolean;

    protected $titles: HTMLElement | undefined;

    protected boxes: TeleBox[];

    public focusedBox: TeleBox | undefined;

    protected containerRect: TeleBoxRect;
    protected allBoxStatusInfo: MaxTitleBarConfig["allBoxStatusInfo"];
}
