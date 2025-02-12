import "./style.scss";
import collectorSVG from "./icons/collector.svg";
import type { TeleStyles } from "../typings";
import type {
    ReadonlyVal,
    ReadonlyValEnhancedResult,
    ValEnhancedResult,
} from "value-enhancer";
import { derive } from "value-enhancer";
import {
    withValueEnhancer,
    Val,
    withReadonlyValueEnhancer,
    ValManager,
} from "value-enhancer";
import { SideEffectManager } from "side-effect-manager";
import type { TeleBoxRect } from "../TeleBox/typings";
import type { TeleBox } from "../TeleBox";
import { onTickEnd } from "../schedulers";
import { getHiddenElementSize } from "./utils";

export interface TeleBoxCollectorConfig {
    namespace?: string;
    styles?: TeleStyles;
    root: HTMLElement;
    minimizedBoxes$: ReadonlyVal<string[]>;
    readonly$: ReadonlyVal<boolean>;
    darkMode$: ReadonlyVal<boolean>;
    boxes$: ReadonlyVal<TeleBox[]>;
    onClick?: (boxId?: string) => void;
}

type ValConfig = {
    styles: Val<TeleStyles>;
    $collector: Val<HTMLElement>;
};

type MyReadonlyValConfig = {
    rect: ReadonlyVal<TeleBoxRect | undefined>;
    visible: ReadonlyVal<boolean>;
    wrp: ReadonlyVal<HTMLElement>;
    popupVisible: ReadonlyVal<boolean>;
};

type CombinedValEnhancedResult = ValEnhancedResult<ValConfig> &
    ReadonlyValEnhancedResult<MyReadonlyValConfig>;

export interface TeleBoxCollector extends CombinedValEnhancedResult {}

export class TeleBoxCollector {
    public constructor({
        minimizedBoxes$,
        readonly$,
        darkMode$,
        boxes$,
        namespace = "telebox",
        styles = {},
        root,
        onClick,
    }: TeleBoxCollectorConfig) {
        this.namespace = namespace;
        this.boxes$ = boxes$;
        this.minimizedBoxes$ = minimizedBoxes$;
        this.root$ = root;
        this.onClick$ = onClick;

        const valManager = new ValManager();
        this._sideEffect.addDisposer(() => valManager.destroy());

        const rect$ = new Val<TeleBoxRect | undefined>(void 0);
        const visible$ = derive(
            minimizedBoxes$,
            (minimizedBoxes) => minimizedBoxes.length > 0
        );
        const styles$ = new Val(styles);
        const el$ = new Val<HTMLElement>(document.createElement("button"));
        const wrp$ = new Val<HTMLElement>(document.createElement("div"));
        const count$ = new Val<HTMLElement>(document.createElement("div"));

        const popupVisible$ = new Val(false);

        const valConfig: ValConfig = {
            styles: styles$,
            $collector: el$,
        };

        withValueEnhancer(this, valConfig, valManager);

        const myReadonlyValConfig: MyReadonlyValConfig = {
            rect: rect$,
            visible: visible$,
            wrp: wrp$,
            popupVisible: popupVisible$,
        };

        withReadonlyValueEnhancer(this, myReadonlyValConfig, valManager);

        el$.value.className = this.wrapClassName("collector");
        el$.value.style.backgroundImage = `url('${collectorSVG}')`;

        wrp$.value.className = this.wrapClassName("collector-wrp");
        count$.value.className = this.wrapClassName("collector-count");

        wrp$.value.appendChild(count$.value);

        this._sideEffect.addDisposer(
            el$.subscribe(($collector) => {
                this._sideEffect.add(() => {
                    root.appendChild(wrp$.value);
                    wrp$.value.appendChild($collector);
                    return () => $collector.remove();
                }, "telebox-collector-mount");

                this._sideEffect.addEventListener(
                    $collector,
                    "click",
                    () => {
                        if (!readonly$.value) {
                            popupVisible$.setValue(!popupVisible$.value);
                        }
                    },
                    {},
                    "telebox-collector-click"
                );

                this._sideEffect.addDisposer(
                    [
                        visible$.subscribe((visible) => {
                            $collector.classList.toggle(
                                this.wrapClassName("collector-visible"),
                                visible
                            );
                            wrp$.value.classList.toggle(
                                this.wrapClassName("collector-visible"),
                                visible
                            );
                            if (!visible) {
                                popupVisible$.setValue(false);
                            } else {
                                this.renderTitles();
                            }
                        }),
                        popupVisible$.subscribe((popupVisible) => {
                            this.$titles?.classList.toggle(
                                this.wrapClassName("collector-hide"),
                                !popupVisible
                            );
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    this.$titles?.classList.toggle(
                                        this.wrapClassName(
                                            "collector-titles-visible"
                                        ),
                                        popupVisible
                                    );
                                });
                            });
                        }),
                        minimizedBoxes$.subscribe((minimizedBoxes) => {
                            count$.value.textContent =
                                minimizedBoxes.length.toString();
                            this.renderTitles();
                        }),
                        readonly$.subscribe((readonly) => {
                            wrp$.value.classList.toggle(
                                this.wrapClassName("collector-readonly"),
                                readonly
                            );
                        }),
                        darkMode$.subscribe((darkMode) => {
                            $collector.classList.toggle(
                                this.wrapClassName("color-scheme-dark"),
                                darkMode
                            );
                            $collector.classList.toggle(
                                this.wrapClassName("color-scheme-light"),
                                !darkMode
                            );
                            wrp$.value.classList.toggle(
                                this.wrapClassName("color-scheme-dark"),
                                darkMode
                            );
                            wrp$.value.classList.toggle(
                                this.wrapClassName("color-scheme-light"),
                                !darkMode
                            );
                        }),
                        styles$.subscribe((styles) => {
                            Object.keys(styles).forEach((key) => {
                                const value = styles[
                                    key as keyof TeleStyles
                                ] as string;
                                if (value != null) {
                                    wrp$.value.style[key as keyof TeleStyles] =
                                        value;
                                }
                            });
                        }),
                        // Place after $collector appended to the DOM so that rect calc works
                        minimizedBoxes$.subscribe((minimizedBoxes) => {
                            if (minimizedBoxes.length > 0) {
                                const { x, y, width, height } =
                                    $collector.getBoundingClientRect();
                                const rootRect = root.getBoundingClientRect();
                                rect$.setValue({
                                    x: x - rootRect.x,
                                    y: y - rootRect.y,
                                    width,
                                    height,
                                });
                            }
                        }),
                    ],
                    "telebox-collector-el"
                );
            })
        );

        const blurPopup = (ev: PointerEvent): void => {
            if (!popupVisible$) return

            const target = ev.target as HTMLElement

            if (target.className.includes('collector')) return

            popupVisible$.setValue(false)
        };
        this._sideEffect.addEventListener(
            window,
            "pointerdown",
            blurPopup,
            true
        );
    }

    protected renderTitles(): HTMLElement {
        if (!this.$titles) {
            this.$titles = document.createElement("div");
            this.$titles.className = this.wrapClassName("collector-titles");

            this.$titles.classList.toggle(
                this.wrapClassName("collector-hide"),
                !this._popupVisible$.value
            );
        }

        this._sideEffect.addEventListener(
            this.$titles,
            "wheel",
            (ev) => {
                if (!ev.deltaX) {
                    (ev.currentTarget as HTMLElement).scrollBy({
                        left: ev.deltaY > 0 ? 250 : -250,
                        behavior: "smooth",
                    });
                }
            },
            { passive: false },
            "min-popup-render-wheel-titles"
        );

        const existContent: HTMLDivElement = this.$titles.querySelector(
            `.${this.wrapClassName("collector-titles-content")}`
        ) as HTMLDivElement;
        const $content: HTMLDivElement = existContent ?? document.createElement("div");
        $content.className = this.wrapClassName("collector-titles-content");
        if (!existContent) {
            this.$titles.appendChild($content);

            this._sideEffect.addEventListener(
                $content,
                "click",
                (ev) => {
                    const target = ev.target as HTMLElement;
                    this.onClick$?.(target.dataset?.teleBoxID)
                },
                {},
                "telebox-collector-titles-content-click"
            );
        }

        $content.innerHTML = ''

        const disposers = this.boxes$.value
            .filter((box) => this.minimizedBoxes$.value.includes(box.id))
            .map((box) => {
                const $tab = document.createElement("button");
                $tab.className = this.wrapClassName("collector-titles-tab");
                $tab.textContent = box.title;
                $tab.dataset.teleBoxID = box.id;
                $tab.dataset.teleTitleBarNoDblClick = "true";

                $content.appendChild($tab);

                return box._title$.reaction(
                    (title) => ($tab.textContent = title)
                );
            });

        this._sideEffect.addDisposer(
            () => disposers.forEach((disposer) => disposer()),
            "min-popup-render-tab-titles"
        );

        const existTitles = this._wrp$.value.querySelector(
            `.${this.wrapClassName("collector-titles")}`
        );
        if (!existTitles) {
            this._wrp$.value.appendChild(this.$titles);
        } else {
            this._wrp$.value.replaceChild(this.$titles, existTitles);
        }

        onTickEnd(() => {
            if (!this.$titles) return;
            const parentRect = this._wrp$.value.getBoundingClientRect();
            const rootRect = this.root$.getBoundingClientRect()
            const popupSize = getHiddenElementSize(this.$titles);

            const isAvailableSpaceTop = (parentRect.top - rootRect.top) > popupSize.height;
            const isAvailableSpaceLeft =
                (parentRect.x - rootRect.x) > (popupSize.width / 2 - parentRect.width / 2);

            const topPosition = -popupSize.height - 10;
            let leftPosition = -(popupSize.width / 2 - parentRect.width / 2);
            if (!isAvailableSpaceTop) {
                const availableHeight = parentRect.top;
                this.$titles.style.height = `${availableHeight}px`;
            }

            if (!isAvailableSpaceLeft) {
                leftPosition = -(parentRect.x - rootRect.x - 4)
            }

            this.$titles.style.top = `${topPosition}px`;
            this.$titles.style.left = `${leftPosition}px`;
        });

        return this.$titles;
    }

    public readonly namespace: string;

    protected readonly _sideEffect = new SideEffectManager();

    public destroy(): void {
        this._sideEffect.flushAll();
        this.$titles = void 0;
    }

    public wrapClassName(className: string): string {
        return `${this.namespace}-${className}`;
    }

    protected $titles: HTMLElement | undefined;
    protected boxes$: TeleBoxCollectorConfig["boxes$"];
    protected minimizedBoxes$: TeleBoxCollectorConfig["minimizedBoxes$"];
    protected root$: TeleBoxCollectorConfig["root"];
    protected onClick$: TeleBoxCollectorConfig["onClick"]
}
