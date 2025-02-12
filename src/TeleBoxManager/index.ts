import "./style.scss";

import shallowequal from "shallowequal";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";
import { genUID, SideEffectManager } from "side-effect-manager";
import type {
    ReadonlyVal,
    ValEnhancedResult,
    ReadonlyValEnhancedResult,
} from "value-enhancer";
import { derive } from "value-enhancer";
import {
    combine,
    Val,
    withValueEnhancer,
    withReadonlyValueEnhancer,
    ValManager,
} from "value-enhancer";
import Emittery from "emittery";
import type {
    ReadonlyTeleBox,
    TeleBoxColorScheme,
    TeleBoxRect,
    TeleBoxState,
} from "../TeleBox";
import {
    TeleBox,
    TELE_BOX_EVENT,
    TELE_BOX_STATE,
    TELE_BOX_COLOR_SCHEME,
    TELE_BOX_DELEGATE_EVENT,
} from "../TeleBox";
import { TeleBoxCollector } from "../TeleBoxCollector";
import { TELE_BOX_MANAGER_EVENT } from "./constants";
import type {
    TeleBoxManagerConfig,
    TeleBoxManagerCreateConfig,
    TeleBoxManagerEventConfig,
    TeleBoxFullscreen,
    TeleBoxManagerQueryConfig,
    TeleBoxManagerThemeConfig,
    TeleBoxManagerUpdateConfig,
} from "./typings";
import { MaxTitleBar } from "./MaxTitleBar";
import { calcStageRect } from "../TeleBox/utils";
import { excludeFromBoth, isAndroid, isIOS, removeByVal, uniqueByVal } from "../utils";
import { onTickEnd } from "../schedulers";

export * from "./typings";
export * from "./constants";

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

type ReadonlyValConfig = {
    darkMode: ReadonlyVal<boolean, boolean>;
    state: ReadonlyVal<TeleBoxState, boolean>;
    root: Val<HTMLElement | null>;
    rootRect: Val<TeleBoxRect>;
    stageRect: ReadonlyVal<TeleBoxRect>;
};

type ValConfig = {
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
    minimizedBoxes: Val<string[]>;
    maximizedBoxes: Val<string[]>;
};

type CombinedValEnhancedResult = ValEnhancedResult<ValConfig> &
    ReadonlyValEnhancedResult<ReadonlyValConfig>;

export interface TeleBoxManager extends CombinedValEnhancedResult {}

export class TeleBoxManager {
    public constructor({
        root = null,
        fullscreen = false,
        prefersColorScheme = TELE_BOX_COLOR_SCHEME.Light,
        minimizedBoxes = [],
        maximizedBoxes = [],
        fence = true,
        collector,
        namespace = "telebox",
        readonly = false,
        stageRatio = -1,
        containerStyle = "",
        stageStyle = "",
        defaultBoxBodyStyle = null,
        defaultBoxStageStyle = null,
        theme = null,
    }: TeleBoxManagerConfig = {}) {
        this._sideEffect = new SideEffectManager();

        this.namespace = namespace;

        const valManager = new ValManager();
        this._sideEffect.addDisposer(() => valManager.destroy());

        const root$ = new Val(root);
        const readonly$ = new Val(readonly);
        const fence$ = new Val(fence);
        const containerStyle$ = new Val(containerStyle);
        const stageStyle$ = new Val(stageStyle);
        const stageRatio$ = new Val(stageRatio);
        const defaultBoxBodyStyle$ = new Val(defaultBoxBodyStyle);
        const defaultBoxStageStyle$ = new Val(defaultBoxStageStyle);
        const fullscreen$ = new Val(fullscreen);
        const maximizedBoxes$ = new Val(maximizedBoxes);
        const minimizedBoxes$ = new Val(minimizedBoxes);

        if (root$.value) {
            root$.value.classList.toggle('touch-screen', isIOS() || isAndroid())
        }

        this.setMaximizedBoxes = (maximizedBoxes, skipUpdate) =>
            maximizedBoxes$.setValue(uniqueByVal(maximizedBoxes), skipUpdate);

        this.setMinimizedBoxes = (minimizedBoxes, skipUpdate) =>
            minimizedBoxes$.setValue(uniqueByVal(minimizedBoxes), skipUpdate);
        const rootRect$ = new Val<TeleBoxRect>(
            {
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            },
            { compare: shallowequal }
        );
        this._sideEffect.addDisposer(
            root$.subscribe((root) => {
                this._sideEffect.add(() => {
                    if (!root) {
                        return () => void 0;
                    }
                    const observer = new ResizeObserver(() => {
                        const rect = root.getBoundingClientRect();
                        rootRect$.setValue({
                            x: 0,
                            y: 0,
                            width: rect.width,
                            height: rect.height,
                        });
                    });
                    observer.observe(root);
                    return () => observer.disconnect();
                }, "calc-root-rect");
            })
        );

        const stageRect$ = combine([rootRect$, stageRatio$], calcStageRect, {
            compare: shallowequal,
        });

        this.boxes$ = new Val<TeleBox[]>([]);
        this.topBox$ = new Val<TeleBox | undefined>(undefined);
        this._sideEffect.addDisposer(
            this.boxes$.subscribe((boxes) => {
                if (boxes.length > 0) {
                    const topBox = boxes.reduce((topBox, box) =>
                        topBox.zIndex > box.zIndex ? topBox : box
                    );
                    this.topBox$.setValue(topBox);
                } else {
                    this.topBox$.setValue(undefined);
                }
            })
        );

        const prefersDarkMatch = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );
        const prefersDark$ = new Val(false);
        if (prefersDarkMatch) {
            prefersDark$.setValue(prefersDarkMatch.matches);
            this._sideEffect.add(() => {
                const handler = (evt: MediaQueryListEvent): void => {
                    prefersDark$.setValue(evt.matches);
                };
                if (prefersDarkMatch.addEventListener) {
                    prefersDarkMatch.addEventListener("change", handler);
                    return () =>
                        prefersDarkMatch.removeEventListener("change", handler);
                } else {
                    // Old Safari
                    prefersDarkMatch.addListener(handler);
                    return () => prefersDarkMatch.removeListener(handler);
                }
            });
        }

        const prefersColorScheme$ = new Val(prefersColorScheme);
        this._sideEffect.addDisposer(
            prefersColorScheme$.reaction((prefersColorScheme, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(
                        TELE_BOX_MANAGER_EVENT.PrefersColorScheme,
                        prefersColorScheme
                    );
                }
            })
        );

        const darkMode$ = combine(
            [prefersDark$, prefersColorScheme$],
            ([prefersDark, prefersColorScheme]) =>
                prefersColorScheme === "auto"
                    ? prefersDark
                    : prefersColorScheme === "dark"
        );

        const state$ = combine(
            [minimizedBoxes$, maximizedBoxes$],
            ([minimized, maximized]): TeleBoxState =>
                minimized.length
                    ? TELE_BOX_STATE.Minimized
                    : maximized.length
                    ? TELE_BOX_STATE.Maximized
                    : TELE_BOX_STATE.Normal
        );

        const theme$ = new Val<TeleBoxManagerThemeConfig | null>(theme, {
            compare: shallowequal,
        });

        const readonlyValConfig: ReadonlyValConfig = {
            darkMode: darkMode$,
            state: state$,
            root: root$,
            rootRect: rootRect$,
            stageRect: stageRect$,
        };

        withReadonlyValueEnhancer(this, readonlyValConfig, valManager);

        const valConfig: ValConfig = {
            fullscreen: fullscreen$,
            prefersColorScheme: prefersColorScheme$,
            readonly: readonly$,
            fence: fence$,
            stageRatio: stageRatio$,
            containerStyle: containerStyle$,
            stageStyle: stageStyle$,
            defaultBoxBodyStyle: defaultBoxBodyStyle$,
            defaultBoxStageStyle: defaultBoxStageStyle$,
            theme: theme$,
            minimizedBoxes: minimizedBoxes$,
            maximizedBoxes: maximizedBoxes$,
        };

        withValueEnhancer(this, valConfig, valManager);

        const closeBtnClassName = this.wrapClassName("titlebar-icon-close");

        const checkFocusBox = (ev: PointerEvent): void => {
            if (!ev.isPrimary || readonly$.value) {
                return;
            }

            const target = ev.target as HTMLElement;
            if (!target.tagName) {
                return;
            }

            for (
                let el: HTMLElement | null = target;
                el;
                el = el.parentElement
            ) {
                if (el.classList && el.classList.contains(closeBtnClassName)) {
                    return;
                }
                const id = el.dataset?.teleBoxID;
                if (id) {
                    const box = this.getBox(id);
                    if (box) {
                        onTickEnd(() => {
                            this.focusBox(box);
                            this.makeBoxTop(box);
                        });

                        return;
                    }
                }
            }
        };

        this._sideEffect.addEventListener(
            window,
            "pointerup",
            checkFocusBox,
            true
        );

        this.$container = document.createElement("div");
        this.$container.className = this.wrapClassName("manager-container");
        this.setTheme(theme);

        this.$stage = document.createElement("div");
        this.$stage.className = this.wrapClassName("manager-stage");
        this.$container.appendChild(this.$stage);

        this._sideEffect.addDisposer([
            darkMode$.subscribe((darkMode) => {
                this.$container.classList.toggle(
                    this.wrapClassName("color-scheme-dark"),
                    darkMode
                );
                this.$container.classList.toggle(
                    this.wrapClassName("color-scheme-light"),
                    !darkMode
                );
            }),
            fullscreen$.subscribe((fullscreen) => {
                this.$container.classList.toggle(
                    this.wrapClassName("is-fullscreen"),
                    Boolean(fullscreen)
                );
            }),
            combine(
                [this.boxes$, fullscreen$],
                ([boxes, fullscreen]) =>
                    fullscreen === "no-titlebar" ||
                    (fullscreen === true && boxes.length <= 1)
            ).subscribe((hideSingleTabTitlebar) => {
                this.$container.classList.toggle(
                    this.wrapClassName("hide-fullscreen-titlebar"),
                    hideSingleTabTitlebar
                );
            }),
            maximizedBoxes$.subscribe((maximizedBoxes) => {
                this.$container.classList.toggle(
                    this.wrapClassName("is-maximized"),
                    !!maximizedBoxes.length
                );
            }),
            minimizedBoxes$.subscribe((minimizedBoxes) => {
                this.$container.classList.toggle(
                    this.wrapClassName("is-minimized"),
                    !!minimizedBoxes.length
                );
            }),
            combine([containerStyle$, theme$]).subscribe(
                ([containerStyle, theme]) => {
                    this.$container.style.cssText = containerStyle;
                    if (theme) {
                        Object.keys(theme).forEach((key) => {
                            this.$container.style.setProperty(
                                `--tele-${key}`,
                                theme[key as keyof TeleBoxManagerThemeConfig] ??
                                    null
                            );
                        });
                    }
                }
            ),
            stageStyle$.subscribe((stageStyle) => {
                this.$stage.style.cssText = stageStyle;
                this.$stage.style.width = stageRect$.value.width + "px";
                this.$stage.style.height = stageRect$.value.height + "px";
            }),
            stageRect$.subscribe((stageRect) => {
                this.$stage.style.width = stageRect.width + "px";
                this.$stage.style.height = stageRect.height + "px";
            }),
            root$.subscribe((root) => {
                if (root) {
                    root.appendChild(this.$container);
                } else if (this.$container.parentElement) {
                    this.$container.remove();
                }
            }),
        ]);

        this.collector =
            collector ??
            new TeleBoxCollector({
                minimizedBoxes$: this._minimizedBoxes$,
                readonly$: readonly$,
                darkMode$: darkMode$,
                namespace,
                boxes$: this.boxes$,
                root: this.$container,
                onClick: (boxId) => {
                    console.log(boxId, removeByVal(this._minimizedBoxes$.value.filter(Boolean), boxId))
                    this.setMinimizedBoxes(removeByVal(this._minimizedBoxes$.value.filter(Boolean), boxId) as string[])
                },
            });

        this.titleBar = new MaxTitleBar({
            namespace: this.namespace,
            title$: derive(this.topBox$, (topBox) => topBox?.title || ""),
            boxes$: this.boxes$,
            darkMode$: darkMode$,
            readonly$: readonly$,
            state$: state$,
            rootRect$: rootRect$,
            stageRect$: stageRect$,
            root: this.$container,
            maximizedBoxes$: maximizedBoxes$,
            minimizedBoxes$: minimizedBoxes$,
            onEvent: (event): void => {
                switch (event.type) {
                    case TELE_BOX_DELEGATE_EVENT.Maximize: {
                        if (this.titleBar.focusedBox?.id) {
                            const oldFocusId = this.titleBar.focusedBox?.id;
                            const isInMaximizedBoxes =
                                this._maximizedBoxes$.value.includes(
                                    oldFocusId
                                );
                            const newMaximizedBoxes: string[] =
                                isInMaximizedBoxes
                                    ? removeByVal(
                                          [...this._maximizedBoxes$.value],
                                          oldFocusId
                                      )
                                    : uniqueByVal([
                                          ...this._maximizedBoxes$.value,
                                          this.titleBar.focusedBox?.id,
                                      ]);

                            this.setMaximizedBoxes(newMaximizedBoxes);

                            const hasTopBox = this.makeBoxTopFromMaximized();

                            const oldFocusBox = this.boxes$.value.find(
                                (box) => box.id == oldFocusId
                            );
                            if (oldFocusBox) {
                                this.makeBoxTop(oldFocusBox);
                            }
                            if (!hasTopBox) {
                                this.setMaximizedBoxes([]);
                            }
                        } else {
                            this.setMaximizedBoxes([]);
                        }
                        break;
                    }
                    case TELE_BOX_DELEGATE_EVENT.Minimize: {
                        if (this.titleBar.focusedBox?.id) {
                            const newMinimizedBoxes: string[] = uniqueByVal([
                                ...this._minimizedBoxes$.value,
                                this.titleBar.focusedBox?.id,
                            ]);

                            this.makeBoxTopFromMaximized();

                            this.setMinimizedBoxes(newMinimizedBoxes);
                        }
                        break;
                    }
                    case TELE_BOX_EVENT.Close: {
                        const focusedId = this.titleBar.focusedBox?.id;
                        if (focusedId) {
                            this.remove(focusedId);
                            this.makeBoxTopFromMaximized();
                            this.setMaximizedBoxes(removeByVal(maximizedBoxes$.value, focusedId))
                        }
                        this.focusTopBox();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            },
        });

        this._sideEffect.addDisposer([
            state$.reaction((state, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.State, state);
                }
            }),
            maximizedBoxes$.reaction((maximizedBoxes, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(
                        TELE_BOX_MANAGER_EVENT.Maximized,
                        maximizedBoxes
                    );
                }
            }),
            minimizedBoxes$.reaction((minimizedBoxes, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(
                        TELE_BOX_MANAGER_EVENT.Minimized,
                        minimizedBoxes
                    );
                }
            }),
            darkMode$.reaction((darkMode, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.DarkMode, darkMode);
                }
            }),
        ]);
    }

    public readonly $container: HTMLDivElement;

    public readonly $stage: HTMLDivElement;

    public get boxes(): ReadonlyArray<TeleBox> {
        return this.boxes$.value;
    }

    public get topBox(): TeleBox | undefined {
        return this.topBox$.value;
    }

    public readonly events = new Emittery<
        TeleBoxManagerEventConfig,
        TeleBoxManagerEventConfig
    >();

    protected _sideEffect: SideEffectManager;

    public readonly namespace: string;

    public setMaximizedBoxes: (
        maximizedBoxes: string[],
        skipUpdate?: boolean
    ) => void;
    public setMinimizedBoxes: (
        minimizedBoxes: string[],
        skipUpdate?: boolean
    ) => void;

    /** @deprecated use setMaximized and setMinimized instead */
    public setState(state: TeleBoxState, skipUpdate = false): this {
        switch (state) {
            case TELE_BOX_STATE.Maximized: {
                this.setMaximizedBoxes(
                    this.boxes$.value.map((item) => item.id),
                    skipUpdate
                );
                this.setMinimizedBoxes([], skipUpdate);
                break;
            }
            case TELE_BOX_STATE.Minimized: {
                this.setMaximizedBoxes([], skipUpdate);
                this.setMinimizedBoxes(
                    this.boxes$.value.map((item) => item.id),
                    skipUpdate
                );
                break;
            }
            default: {
                this.setMaximizedBoxes([], skipUpdate);
                this.setMinimizedBoxes([], skipUpdate);
                break;
            }
        }
        return this;
    }

    public create(
        config: TeleBoxManagerCreateConfig = {},
        smartPosition = true
    ): ReadonlyTeleBox {
        const id = config.id || genUID();

        const managerMaximized$ = new Val(
            this._maximizedBoxes$.value.includes(id)
        );

        const managerMinimized$ = new Val(
            this._minimizedBoxes$.value.includes(id)
        );

        this._maximizedBoxes$.subscribe((maximizedBoxes) =>
            managerMaximized$.setValue(maximizedBoxes.includes(id))
        );
        this._minimizedBoxes$.subscribe((minimizedBoxes) =>
            managerMinimized$.setValue(minimizedBoxes.includes(id))
        );

        const box = new TeleBox({
            zIndex: this.topBox ? this.topBox.zIndex + 1 : 100,
            ...config,
            ...(smartPosition ? this.smartPosition(config) : {}),
            id,
            namespace: this.namespace,
            root: this.$stage,
            darkMode$: this._darkMode$,
            fence$: this._fence$,
            rootRect$: this._rootRect$,
            managerStageRect$: this._stageRect$,
            managerStageRatio$: this._stageRatio$,
            managerMaximized$: managerMaximized$,
            managerMinimized$: managerMinimized$,
            managerReadonly$: this._readonly$,
            collectorRect$: this.collector._rect$,
            defaultBoxBodyStyle$: this._defaultBoxBodyStyle$,
            defaultBoxStageStyle$: this._defaultBoxStageStyle$,
        });

        if (box.focus) {
            this.focusBox(box);
            if (smartPosition) {
                this.makeBoxTop(box);
            }
        }

        this.boxes$.setValue([...this.boxes, box]);

        this._sideEffect.addDisposer([
            box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Maximize, () => {
                this.setMaximizedBoxes(
                    this.boxes$.value.map((item) => item.id)
                );
                this.titleBar.focusBox(box);
            }),
            box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Minimize, () => {
                this.setMinimizedBoxes([...this._minimizedBoxes$.value, id]);
            }),
            box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Close, () => {
                this.remove(box);
                this.makeBoxTopFromMaximized(box.id);
                this.focusTopBox();
            }),
            box._intrinsicCoord$.reaction((_, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicMove, box);
                }
            }),
            box._intrinsicSize$.reaction((_, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(
                        TELE_BOX_MANAGER_EVENT.IntrinsicResize,
                        box
                    );
                }
            }),
            box._zIndex$.reaction((_, skipUpdate) => {
                if (this.boxes.length > 0) {
                    const topBox = this.boxes.reduce((topBox, box) =>
                        topBox.zIndex > box.zIndex ? topBox : box
                    );
                    this.topBox$.setValue(topBox);
                }
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.ZIndex, box);
                }
            }),
        ]);

        this.events.emit(TELE_BOX_MANAGER_EVENT.Created, box);

        return box;
    }

    public query(config?: TeleBoxManagerQueryConfig): ReadonlyTeleBox[] {
        return config
            ? this.boxes.filter(this.teleBoxMatcher(config))
            : [...this.boxes];
    }

    public queryOne(
        config?: TeleBoxManagerQueryConfig
    ): ReadonlyTeleBox | undefined {
        return config
            ? this.boxes.find(this.teleBoxMatcher(config))
            : this.boxes[0];
    }

    public update(
        boxID: string,
        config: TeleBoxManagerUpdateConfig,
        skipUpdate = false
    ): void {
        const box = this.boxes.find((box) => box.id === boxID);
        if (box) {
            return this.updateBox(box, config, skipUpdate);
        }
    }

    public updateAll(
        config: TeleBoxManagerUpdateConfig,
        skipUpdate = false
    ): void {
        this.boxes.forEach((box) => {
            this.updateBox(box, config, skipUpdate);
        });
    }

    public remove(
        boxOrID: string | TeleBox,
        skipUpdate = false
    ): ReadonlyTeleBox | undefined {
        const index = this.getBoxIndex(boxOrID);
        if (index >= 0) {
            const boxes = this.boxes.slice();
            const deletedBoxes = boxes.splice(index, 1);
            this.boxes$.setValue(boxes);
            deletedBoxes.forEach((box) => box.destroy());
            const boxId = this.getBox(boxOrID)?.id;
            if (boxId) {
                this.setMaximizedBoxes(
                    removeByVal(this._maximizedBoxes$.value, boxId)
                );
                this.setMinimizedBoxes(
                    removeByVal(this._minimizedBoxes$.value, boxId)
                );
            }
            if (!skipUpdate) {
                if (this.boxes.length <= 0) {
                    this.setMaximizedBoxes([]);
                    this.setMinimizedBoxes([]);
                }
                this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
            }
            return deletedBoxes[0];
        }
        return;
    }

    public removeTopBox(): ReadonlyTeleBox | undefined {
        if (this.topBox) {
            return this.remove(this.topBox);
        }
        return;
    }

    public removeAll(skipUpdate = false): ReadonlyTeleBox[] {
        const deletedBoxes = this.boxes$.value;
        this.boxes$.setValue([]);
        deletedBoxes.forEach((box) => box.destroy());
        if (!skipUpdate) {
            if (this.boxes.length <= 0) {
                this.setMaximizedBoxes([]);
                this.setMinimizedBoxes([]);
            }
            this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
        }
        return deletedBoxes;
    }

    /**
     * Mount manager to a container element.
     */
    public mount(root: HTMLElement): void {
        this._root$.setValue(root);
    }

    /**
     * Unmount manager from the container element.
     */
    public unmount(): void {
        this._root$.setValue(null);
    }

    public destroy(skipUpdate = false): void {
        this.events.clearListeners();
        this._sideEffect.flushAll();
        this.removeAll(skipUpdate);
        this.collector.destroy();
        this.titleBar.destroy();
    }

    public wrapClassName(className: string): string {
        return `${this.namespace}-${className}`;
    }

    public focusBox(boxOrID: string | TeleBox, skipUpdate = false): void {
        const targetBox = this.getBox(boxOrID);
        if (targetBox) {
            this.boxes.forEach((box) => {
                if (targetBox === box) {
                    let focusChanged = false;
                    if (!targetBox.focus) {
                        focusChanged = true;
                        targetBox._focus$.setValue(true, skipUpdate);
                    }
                    if (focusChanged && !skipUpdate) {
                        this.events.emit(
                            TELE_BOX_MANAGER_EVENT.Focused,
                            targetBox
                        );
                    }
                } else if (box.focus) {
                    if (!this._maximizedBoxes$.value.includes(box.id)) {
                        this.blurBox(box, skipUpdate);
                    }
                }
            });

            if (this._maximizedBoxes$.value.length > 0) {
                if (this._maximizedBoxes$.value.includes(targetBox.id)) {
                    this.titleBar.focusBox(targetBox);
                }
            } else {
                this.titleBar.focusBox(targetBox);
            }
        }
    }

    public focusTopBox(): void {
        if (this.topBox && !this.topBox.focus) {
            return this.focusBox(this.topBox);
        }
    }

    public blurBox(boxOrID: string | TeleBox, skipUpdate = false): void {
        const targetBox = this.getBox(boxOrID);
        if (targetBox) {
            if (targetBox.focus) {
                targetBox._focus$.setValue(false, skipUpdate);
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, targetBox);
                }
            }
            if (this.titleBar.focusedBox === targetBox) {
                this.titleBar.focusBox();
            }
        }
    }

    public blurAll(skipUpdate = false): void {
        this.boxes.forEach((box) => {
            if (box.focus) {
                box._focus$.setValue(false, skipUpdate);
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, box);
                }
            }
        });
        if (this.titleBar.focusedBox) {
            this.titleBar.focusBox();
        }
    }

    public collector: TeleBoxCollector;
    public titleBar: MaxTitleBar;

    protected boxes$: Val<TeleBox[]>;
    protected topBox$: Val<TeleBox | undefined>;

    protected teleBoxMatcher(
        config: TeleBoxManagerQueryConfig
    ): (box: TeleBox) => boolean {
        const keys = Object.keys(config) as Array<
            keyof TeleBoxManagerQueryConfig
        >;
        return (box: TeleBox): boolean =>
            keys.every((key) => config[key] === box[key]);
    }

    protected updateBox(
        box: TeleBox,
        config: TeleBoxManagerUpdateConfig,
        skipUpdate = false
    ): void {
        if (config.x != null || config.y != null) {
            box._intrinsicCoord$.setValue(
                {
                    x: config.x ?? box.intrinsicX,
                    y: config.y ?? box.intrinsicY,
                },
                skipUpdate
            );
        }
        if (config.width != null || config.height != null) {
            box._intrinsicSize$.setValue(
                {
                    width: config.width ?? box.intrinsicWidth,
                    height: config.height ?? box.intrinsicHeight,
                },
                skipUpdate
            );
        }
        if (config.title != null) {
            box._title$.setValue(config.title);
        }
        if (config.visible != null) {
            box._visible$.setValue(config.visible, skipUpdate);
        }
        if (config.resizable != null) {
            box._resizable$.setValue(config.resizable, skipUpdate);
        }
        if (config.draggable != null) {
            box._draggable$.setValue(config.draggable, skipUpdate);
        }
        if (config.boxRatio != null) {
            box._boxRatio$.setValue(config.boxRatio, skipUpdate);
        }
        if (config.zIndex != null) {
            box._zIndex$.setValue(config.zIndex, skipUpdate);
        }
        if (config.stageRatio !== undefined) {
            box.setStageRatio(config.stageRatio, skipUpdate);
        }
        if (config.content != null) {
            box.mountContent(config.content);
        }
        if (config.footer != null) {
            box.mountFooter(config.footer);
        }
        if (config.minHeight != null || config.minWidth != null) {
            box._minSize$.setValue(
                {
                    width: config.minWidth ?? box.minWidth,
                    height: config.minHeight ?? box.minHeight,
                },
                skipUpdate
            );
        }
    }

    /** Keep new boxes staggered inside stage area */
    protected smartPosition(rect: Partial<TeleBoxRect>): TeleBoxRect {
        let { x, y } = rect;
        const { width = 0.5, height = 0.5 } = rect;
        const stageRect = this.stageRect;
        const topBox = this.topBox;

        if (x == null) {
            let pxX = 20;
            if (topBox) {
                const pxPreferredX = topBox.pxIntrinsicCoord.x + 20;
                const pxIntrinsicWidth = width * stageRect.width;
                if (pxPreferredX + pxIntrinsicWidth <= stageRect.width) {
                    pxX = pxPreferredX;
                }
            }
            x = pxX / stageRect.width;
        }

        if (y == null) {
            let pxY = 20;
            if (topBox) {
                const pxPreferredY = topBox.pxIntrinsicCoord.y + 20;
                const pxIntrinsicHeight = height * stageRect.height;
                if (pxPreferredY + pxIntrinsicHeight <= stageRect.height) {
                    pxY = pxPreferredY;
                }
            }
            y = pxY / stageRect.height;
        }

        return { x, y, width, height };
    }

    protected makeBoxTop(box: TeleBox, skipUpdate = false): void {
        if (this.topBox) {
            if (box !== this.topBox) {
                if (this._maximizedBoxes$.value.includes(box.id)) {
                    const newIndex = this.topBox.zIndex + 1;

                    const normalBoxesIds = excludeFromBoth(
                        this.boxes$.value.map((item) => item.id),
                        this._maximizedBoxes$.value,
                        this._minimizedBoxes$.value
                    );
                    const normalBoxes = this.boxes$.value.filter((box) =>
                        normalBoxesIds.includes(box.id)
                    );

                    box._zIndex$.setValue(newIndex, skipUpdate);

                    normalBoxes
                        .sort((a, b) => a._zIndex$.value - b._zIndex$.value)
                        .forEach((box, index) => {
                            box._zIndex$.setValue(
                                newIndex + 1 + index,
                                skipUpdate
                            );
                        });
                } else {
                    box._zIndex$.setValue(this.topBox.zIndex + 1, skipUpdate);
                }
            }
        }
    }

    protected makeBoxTopFromMaximized(boxId?: string): boolean {
        let maxIndexBox = undefined;
        if (boxId) {
            if (
                this._maximizedBoxes$.value.includes(boxId) &&
                !this._minimizedBoxes$.value.includes(boxId)
            ) {
                maxIndexBox = this.boxes$.value.find((box) => box.id === boxId);
            }
        } else {
            const nextFocusBoxes = this.boxes$.value.filter((box) => {
                return (
                    box.id != this.titleBar.focusedBox?.id &&
                    this._maximizedBoxes$.value.includes(box.id) &&
                    !this._minimizedBoxes$.value.includes(box.id)
                );
            });

            maxIndexBox = nextFocusBoxes.length
                ? nextFocusBoxes.reduce((maxItem, current) => {
                      return current._zIndex$.value > maxItem._zIndex$.value
                          ? current
                          : maxItem;
                  })
                : undefined;

            if (maxIndexBox) {
                this.titleBar.focusBox(maxIndexBox);
            }
        }

        return !!maxIndexBox;
    }

    protected getBoxIndex(boxOrID: TeleBox | string): number {
        return typeof boxOrID === "string"
            ? this.boxes.findIndex((box) => box.id === boxOrID)
            : this.boxes.findIndex((box) => box === boxOrID);
    }

    protected getBox(boxOrID: TeleBox | string): TeleBox | undefined {
        return typeof boxOrID === "string"
            ? this.boxes.find((box) => box.id === boxOrID)
            : boxOrID;
    }
}
