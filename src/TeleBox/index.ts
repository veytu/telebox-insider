import "./style.scss";
import shadowStyles from "./style.shadow.scss?inline";

import Emittery from "emittery";
import styler from "stylefire";
import shallowequal from "shallowequal";
import { genUID, SideEffectManager } from "side-effect-manager";
import type {
    ReadonlyVal,
    ReadonlyValEnhancedResult,
    ValEnhancedResult,
} from "value-enhancer";
import {
    combine,
    Val,
    withReadonlyValueEnhancer,
    withValueEnhancer,
    ValManager,
} from "value-enhancer";
import type { TeleTitleBar } from "../TeleTitleBar";
import { DefaultTitleBar } from "../TeleTitleBar";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";
import { clamp, getBoxDefaultName, preventEvent } from "../utils";
import {
    TELE_BOX_EVENT,
    TELE_BOX_STATE,
    TELE_BOX_RESIZE_HANDLE,
} from "./constants";
import type {
    TeleBoxConfig,
    TeleBoxHandleType,
    TeleBoxState,
    TeleBoxCoord,
    TeleBoxSize,
    TeleBoxEventConfig,
    TeleBoxEvent,
    TeleBoxDelegateEventConfig,
    TeleBoxRect,
    TeleBoxDelegateEventData,
} from "./typings";
import { calcStageRect } from "./utils";

export * from "./constants";
export * from "./typings";

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill;

type RequiredTeleBoxConfig = Required<TeleBoxConfig>;

type ValConfig = {
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

type PropsValConfig = {
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

type MyReadonlyValConfig = {
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

type CombinedValEnhancedResult = ReadonlyValEnhancedResult<
    PropsValConfig & MyReadonlyValConfig
> &
    ValEnhancedResult<ValConfig>;

export interface TeleBox extends CombinedValEnhancedResult {}

export class TeleBox {
    public constructor({
        id = genUID(),
        title = getBoxDefaultName(),
        namespace = "telebox",
        visible = true,
        width = 0.5,
        height = 0.5,
        minWidth = 0,
        minHeight = 0,
        x = 0.1,
        y = 0.1,
        resizable = true,
        draggable = true,
        boxRatio = -1,
        focus = false,
        zIndex = 100,
        stageRatio = null,
        enableShadowDOM = true,
        titleBar,
        content,
        stage,
        footer,
        styles,
        userStyles,
        bodyStyle = null,
        stageStyle = null,
        darkMode$,
        fence$,
        root,
        rootRect$,
        managerMinimized$,
        managerMaximized$,
        managerReadonly$,
        managerStageRect$,
        managerStageRatio$,
        defaultBoxBodyStyle$,
        defaultBoxStageStyle$,
        collectorRect$,
    }: TeleBoxConfig) {
        this._sideEffect = new SideEffectManager();

        this.id = id;
        this.namespace = namespace;
        this.enableShadowDOM = enableShadowDOM;

        const valManager = new ValManager();
        this._sideEffect.addDisposer(() => valManager.destroy());

        const title$ = new Val(title);
        const visible$ = new Val(visible);
        const resizable$ = new Val(resizable);
        const draggable$ = new Val(draggable);
        const boxRatio$ = new Val(boxRatio);
        const zIndex$ = new Val(zIndex);
        const focus$ = new Val(focus);

        const boxMaximized$ = new Val<boolean | null>(null);
        const boxMinimized$ = new Val<boolean | null>(null);
        const boxReadonly$ = new Val<boolean | null>(null);

        const maximized$ = combine(
            [boxMaximized$, managerMaximized$],
            ([boxMaximized, managerMaximized]) => {
                return boxMaximized ?? managerMaximized
            }

        );
        const minimized$ = combine(
            [boxMinimized$, managerMinimized$],
            ([boxMinimized, managerMinimized]) =>
                boxMinimized ?? managerMinimized
        );
        const readonly$ = combine(
            [boxReadonly$, managerReadonly$],
            ([boxReadonly, managerReadonly]) => boxReadonly ?? managerReadonly
        );

        const state$ = combine(
            [minimized$, maximized$],
            ([minimized, maximized]): TeleBoxState => {
                return minimized
                ? TELE_BOX_STATE.Minimized
                : maximized
                ? TELE_BOX_STATE.Maximized
                : TELE_BOX_STATE.Normal
            }
        );

        const minSize$ = new Val(
            {
                width: clamp(minWidth, 0, 1),
                height: clamp(minHeight, 0, 1),
            },
            { compare: shallowequal }
        );

        const pxMinSize$ = combine(
            [minSize$, managerStageRect$],
            ([minSize, managerStageRect]) => ({
                width: minSize.width * managerStageRect.width,
                height: minSize.height * managerStageRect.height,
            }),
            { compare: shallowequal }
        );

        const intrinsicSize$ = new Val(
            { width, height },
            { compare: shallowequal }
        );

        this._sideEffect.addDisposer(
            // check intrinsicSize overflow
            minSize$.reaction((minSize, skipUpdate) => {
                intrinsicSize$.setValue(
                    {
                        width: Math.max(width, minSize.width),
                        height: Math.max(height, minSize.height),
                    },
                    skipUpdate
                );
            })
        );

        const intrinsicCoord$ = new Val({ x, y }, { compare: shallowequal });

        const pxIntrinsicSize$ = combine(
            [intrinsicSize$, managerStageRect$],
            ([size, managerStageRect]) => ({
                width: managerStageRect.width * size.width,
                height: managerStageRect.height * size.height,
            }),
            { compare: shallowequal }
        );

        const pxIntrinsicCoord$ = combine(
            [intrinsicCoord$, managerStageRect$],
            ([intrinsicCoord, managerStageRect]) => ({
                x: intrinsicCoord.x * managerStageRect.width,
                y: intrinsicCoord.y * managerStageRect.height,
            }),
            { compare: shallowequal }
        );

        const bodyStyle$ = new Val<string | null>(bodyStyle);
        const stageStyle$ = new Val<string | null>(stageStyle);

        const contentRoot$ = new Val<HTMLElement | null>(null);
        const bodyRect$ = new Val<TeleBoxRect>(managerStageRect$.value, {
            compare: shallowequal,
        });
        const stageRatio$ = new Val(stageRatio);
        const finalStageRatio$ = combine(
            [stageRatio$, managerStageRatio$],
            ([stageRatio, managerStageRatio]) => stageRatio ?? managerStageRatio
        );
        const stageRect$ = combine(
            [bodyRect$, finalStageRatio$],
            calcStageRect,
            { compare: shallowequal }
        );

        const propsValConfig: PropsValConfig = {
            darkMode: darkMode$,
            fence: fence$,
            rootRect: rootRect$,
            managerMinimized: managerMinimized$,
            managerMaximized: managerMaximized$,
            managerReadonly: managerReadonly$,
            managerStageRect: managerStageRect$,
            managerStageRatio: managerStageRatio$,
            defaultBoxBodyStyle: defaultBoxBodyStyle$,
            defaultBoxStageStyle: defaultBoxStageStyle$,
            collectorRect: collectorRect$,
        };

        withReadonlyValueEnhancer(this, propsValConfig);

        const myReadonlyValConfig: MyReadonlyValConfig = {
            zIndex: zIndex$,
            focus: focus$,

            state: state$,
            minSize: minSize$,
            pxMinSize: pxMinSize$,
            intrinsicSize: intrinsicSize$,
            intrinsicCoord: intrinsicCoord$,
            pxIntrinsicSize: pxIntrinsicSize$,
            pxIntrinsicCoord: pxIntrinsicCoord$,
            bodyRect: bodyRect$,
            stageRect: stageRect$,
            minimized: minimized$,
            maximized: maximized$,
            readonly: readonly$,
        };

        withReadonlyValueEnhancer(this, myReadonlyValConfig, valManager);

        const valConfig: ValConfig = {
            title: title$,
            visible: visible$,
            resizable: resizable$,
            draggable: draggable$,
            boxRatio: boxRatio$,
            boxMinimized: boxMinimized$,
            boxMaximized: boxMaximized$,
            boxReadonly: boxReadonly$,
            stageRatio: stageRatio$,
            bodyStyle: bodyStyle$,
            stageStyle: stageStyle$,
        };

        withValueEnhancer(this, valConfig, valManager);

        this.titleBar =
            titleBar ||
            new DefaultTitleBar({
                readonly$: readonly$,
                state$: state$,
                title$: title$,
                namespace: this.namespace,
                onDragStart: (event) => this._handleTrackStart?.(event),
                onEvent: (event) => this._delegateEvents.emit(event.type, this.id),
                boxId: this.id
            });

        this._sideEffect.addDisposer(
            combine([boxRatio$, minimized$]).subscribe(
                ([boxRatio, minimized]) => {
                    if (!minimized && boxRatio > 0) {
                        this.transform(
                            pxIntrinsicCoord$.value.x,
                            pxIntrinsicCoord$.value.y,
                            pxIntrinsicSize$.value.width,
                            pxIntrinsicSize$.value.height
                        );
                    }
                }
            )
        );

        this._sideEffect.addDisposer(
            fence$.subscribe((fence) => {
                if (fence) {
                    this.move(
                        pxIntrinsicCoord$.value.x,
                        pxIntrinsicCoord$.value.y
                    );
                }
            })
        );

        this.$box = this._render();
        contentRoot$.setValue(this.$content.parentElement);
        content && this.mountContent(content);
        stage && this.mountStage(stage);
        footer && this.mountFooter(footer);
        styles && this.mountStyles(styles);
        userStyles && this.mountUserStyles(userStyles);
        root.appendChild(this.$box);

        const watchValEvent = <E extends TeleBoxEvent>(
            val: ReadonlyVal<TeleBoxEventConfig[E], boolean>,
            event: E
        ) => {
            this._sideEffect.addDisposer(
                val.reaction((v, skipUpdate) => {
                    if (!skipUpdate) {
                        this.events.emit<any>(event, v);
                    }
                })
            );
        };

        watchValEvent(darkMode$, TELE_BOX_EVENT.DarkMode);
        watchValEvent(readonly$, TELE_BOX_EVENT.Readonly);
        watchValEvent(zIndex$, TELE_BOX_EVENT.ZIndex);
        watchValEvent(minimized$, TELE_BOX_EVENT.Minimized);
        watchValEvent(maximized$, TELE_BOX_EVENT.Maximized);
        watchValEvent(state$, TELE_BOX_EVENT.State);
        watchValEvent(intrinsicSize$, TELE_BOX_EVENT.IntrinsicResize);
        watchValEvent(intrinsicCoord$, TELE_BOX_EVENT.IntrinsicMove);

        this._sideEffect.addDisposer([
            visible$.reaction((visible, skipUpdate) => {
                if (!skipUpdate && !visible) {
                    this.events.emit(TELE_BOX_EVENT.Close);
                }
            }),
            focus$.reaction((focus, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(
                        focus ? TELE_BOX_EVENT.Focus : TELE_BOX_EVENT.Blur
                    );
                }
            }),
        ]);
    }

    public readonly id: string;

    /** ClassName Prefix. For CSS styling. Default "telebox" */
    public readonly namespace: string;

    /** Enable shadow DOM for box content. Default true. */
    public readonly enableShadowDOM: boolean;

    public readonly events = new Emittery<
        TeleBoxEventConfig,
        TeleBoxEventConfig
    >();

    public readonly _delegateEvents = new Emittery<
        TeleBoxDelegateEventData,
        TeleBoxDelegateEventConfig,
        TeleBoxDelegateEventConfig
    >();

    protected _sideEffect: SideEffectManager;

    public titleBar: TeleTitleBar;

    /** Minimum box width relative to stage area. 0~1. Default 0. */
    public get minWidth(): number {
        return this._minSize$.value.width;
    }

    /** Minimum box height relative to stage area. 0~1. Default 0. */
    public get minHeight(): number {
        return this._minSize$.value.height;
    }

    /**
     * @param minWidth Minimum box width relative to stage area. 0~1.
     * @returns this
     */
    public setMinWidth(minWidth: number, skipUpdate = false): void {
        this._minSize$.setValue(
            { width: minWidth, height: this.minHeight },
            skipUpdate
        );
    }

    /**
     * @param minHeight Minimum box height relative to container element. 0~1.
     * @returns this
     */
    public setMinHeight(minHeight: number, skipUpdate = false): void {
        this._minSize$.setValue(
            { width: this.minWidth, height: minHeight },
            skipUpdate
        );
    }

    /**
     * Resize box.
     * @param width Box width relative to container element. 0~1.
     * @param height Box height relative to container element. 0~1.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    public resize(width: number, height: number, skipUpdate = false): void {
        this._intrinsicSize$.setValue(
            {
                width: Math.max(width, this.minWidth),
                height: Math.max(height, this.minHeight),
            },
            skipUpdate
        );
    }

    /** Intrinsic box x position relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    public get intrinsicX(): number {
        return this._intrinsicCoord$.value.x;
    }

    /** Intrinsic box y position relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    public get intrinsicY(): number {
        return this._intrinsicCoord$.value.y;
    }

    /** Intrinsic box width relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    public get intrinsicWidth(): number {
        return this._intrinsicSize$.value.width;
    }

    /** Intrinsic box height relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    public get intrinsicHeight(): number {
        return this._intrinsicSize$.value.height;
    }

    /**
     * Move box position.
     * @param x x position in px.
     * @param y y position in px.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    protected move(x: number, y: number, skipUpdate = false): void {
        let safeX: number;
        let safeY: number;
        const managerStageRect = this.managerStageRect;
        const pxIntrinsicSize = this.pxIntrinsicSize;

        if (this.fence) {
            safeX = clamp(x, 0, managerStageRect.width - pxIntrinsicSize.width);
            safeY = clamp(
                y,
                0,
                managerStageRect.height - pxIntrinsicSize.height
            );
        } else {
            safeX = clamp(
                x,
                -(pxIntrinsicSize.width - 120),
                0 + managerStageRect.width - 20
            );
            safeY = clamp(y, 0, 0 + managerStageRect.height - 20);
        }

        this._intrinsicCoord$.setValue(
            {
                x: safeX / managerStageRect.width,
                y: safeY / managerStageRect.height,
            },
            skipUpdate
        );
    }

    /**
     * Resize + Move, with respect to fixed ratio.
     * @param x x position in px.
     * @param y y position in px.
     * @param width Box width in px.
     * @param height Box height in px.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    protected transform(
        x: number,
        y: number,
        width: number,
        height: number,
        skipUpdate = false
    ): void {
        const managerStageRect = this.managerStageRect;

        width = Math.max(width, this.pxMinSize.width);
        height = Math.max(height, this.pxMinSize.height);

        if (this.boxRatio > 0) {
            const newHeight = this.boxRatio * width;
            if (y !== this.pxIntrinsicCoord.y) {
                y -= newHeight - height;
            }
            height = newHeight;
        }

        if (y < 0) {
            y = 0;
            height = this.pxIntrinsicSize.height;
        }

        this.move(x, y, skipUpdate);
        this._intrinsicSize$.setValue(
            {
                width: width / managerStageRect.width,
                height: height / managerStageRect.height,
            },
            skipUpdate
        );
    }

    private $authorContent?: HTMLElement;

    /** Mount dom to box content. */
    public mountContent(content: HTMLElement): void {
        this.$authorContent?.remove();
        this.$authorContent = content;
        this.$content.appendChild(content);
    }

    /**  Unmount content from the box. */
    public unmountContent(): void {
        if (this.$authorContent) {
            this.$authorContent.remove();
            this.$authorContent = undefined;
        }
    }

    private $authorStage?: HTMLElement;

    /** Mount dom to box stage. */
    public mountStage(stage: HTMLElement): void {
        this.$authorStage?.remove();
        this.$authorStage = stage;
        if (!this.$stage) {
            this.$stage = this._renderStage();
        }
        this.$stage.appendChild(stage);
        if (!this.$stage.parentElement) {
            this.$body.appendChild(this.$stage);
        }
    }

    /** Unmount content from the box. */
    public unmountStage(): void {
        if (this.$authorStage) {
            this.$authorStage.remove();
            this.$authorStage = undefined;
        }
        this.$stage?.remove();
    }

    private $authorFooter?: HTMLElement;

    /** Mount dom to box Footer. */
    public mountFooter(footer: HTMLElement): void {
        this.$authorFooter?.remove();
        this.$authorFooter = footer;
        this.$footer.appendChild(footer);
    }

    /** Unmount Footer from the box. */
    public unmountFooter(): void {
        if (this.$authorFooter) {
            this.$authorFooter.remove();
            this.$authorFooter = undefined;
        }
    }

    /** Mount styles for box content */
    public mountStyles(styles: string): void {
        this.$styles.textContent = styles;
    }

    /** Umount styles for box content */
    public unmountStyles(): void {
        this.$styles.textContent = "";
    }

    /** Mount user styles for box content */
    public mountUserStyles(styles: string): void {
        this.$userStyles.textContent = styles;
    }

    /** Umount user styles for box content */
    public unmountUserStyles(): void {
        this.$userStyles.textContent = "";
    }

    /** DOM of the box */
    public $box: HTMLElement;

    /** DOM of main area of the box. Including $body and $footer. */
    public $main!: HTMLElement;

    /** DOM of the box body */
    public $body!: HTMLElement;

    /** DOM of the box content container inside box body */
    public $content!: HTMLElement;

    /** DOM of the box stage area inside box body */
    public $stage?: HTMLElement;

    /** DOM of custom box content styles */
    public $styles!: HTMLStyleElement;

    /** DOM of end user custom box content styles */
    public $userStyles!: HTMLStyleElement;

    /** DOM of the box title bar container */
    public $titleBar!: HTMLElement;

    /** DOM of the box footer container */
    public $footer!: HTMLElement;

    private _render(): HTMLElement {
        if (this.$box) {
            return this.$box;
        }

        const bindBoxStates = (el: Element, disposerID?: string): string => {
            return this._sideEffect.addDisposer(
                [
                    this._readonly$.subscribe((readonly) =>
                        el.classList.toggle(
                            this.wrapClassName("readonly"),
                            readonly
                        )
                    ),
                    this._draggable$.subscribe((draggable) =>
                        el.classList.toggle(
                            this.wrapClassName("no-drag"),
                            !draggable
                        )
                    ),
                    this._resizable$.subscribe((resizable) =>
                        el.classList.toggle(
                            this.wrapClassName("no-resize"),
                            !resizable
                        )
                    ),
                    this._focus$.subscribe((focus) =>
                        el.classList.toggle(this.wrapClassName("blur"), !focus)
                    ),
                    this._darkMode$.subscribe((darkMode) => {
                        el.classList.toggle(
                            this.wrapClassName("color-scheme-dark"),
                            darkMode
                        );
                        el.classList.toggle(
                            this.wrapClassName("color-scheme-light"),
                            !darkMode
                        );
                    }),
                ],
                disposerID
            );
        };

        this.$box = document.createElement("div");
        this.$box.classList.add(this.wrapClassName("box"));
        bindBoxStates(this.$box, "bind-box-state");

        this._sideEffect.add(() => {
            const minimizedClassName = this.wrapClassName("minimized");
            const maximizedClassName = this.wrapClassName("maximized");
            const MAXIMIZED_TIMER_ID = "box-maximized-timer";

            return this._state$.subscribe((state) => {
                this.$box.classList.toggle(
                    minimizedClassName,
                    state === TELE_BOX_STATE.Minimized
                );

                if (state === TELE_BOX_STATE.Maximized) {
                    this._sideEffect.flush(MAXIMIZED_TIMER_ID);
                    this.$box.classList.toggle(maximizedClassName, true);
                } else {
                    // delay so that transition won't be triggered
                    this._sideEffect.setTimeout(
                        () => {
                            this.$box.classList.toggle(
                                maximizedClassName,
                                false
                            );
                        },
                        0,
                        MAXIMIZED_TIMER_ID
                    );
                }
            });
        });

        this._sideEffect.addDisposer(
            this._visible$.subscribe((visible) => {
                this.$box.style.display = visible ? "block" : "none";
            })
        );

        this._sideEffect.addDisposer(
            this._zIndex$.subscribe((zIndex) => {
                this.$box.style.zIndex = String(zIndex);
            })
        );

        this.$box.dataset.teleBoxID = this.id;

        const boxStyler = styler(this.$box);

        const boxStyles$ = combine(
            [
                this._maximized$,
                this._minimized$,
                this._pxIntrinsicSize$,
                this._pxIntrinsicCoord$,
                this._collectorRect$,
                this._rootRect$,
                this._managerStageRect$,
            ],
            ([
                maximized,
                minimized,
                pxIntrinsicSize,
                pxIntrinsicCoord,
                collectorRect,
                rootRect,
                managerStageRect,
            ]) => {
                const styles: {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                    scaleX: number;
                    scaleY: number;
                } = maximized
                    ? {
                          x: -managerStageRect.x,
                          y: -managerStageRect.y,
                          width: rootRect.width,
                          height: rootRect.height,
                          scaleX: 1,
                          scaleY: 1,
                      }
                    : {
                          x: pxIntrinsicCoord.x,
                          y: pxIntrinsicCoord.y,
                          width: pxIntrinsicSize.width,
                          height: pxIntrinsicSize.height,
                          scaleX: 1,
                          scaleY: 1,
                      };
                if (minimized && collectorRect) {
                    const { width: boxWidth, height: boxHeight } = maximized
                        ? this.rootRect
                        : pxIntrinsicSize;
                    styles.x =
                        collectorRect.x -
                        boxWidth / 2 +
                        collectorRect.width / 2 -
                        managerStageRect.x;
                    styles.y =
                        collectorRect.y -
                        boxHeight / 2 +
                        collectorRect.height / 2 -
                        managerStageRect.y;
                    styles.scaleX = collectorRect.width / boxWidth;
                    styles.scaleY = collectorRect.height / boxHeight;
                }
                return styles;
            },
            { compare: shallowequal }
        );

        const boxStyles = boxStyles$.value;
        this.$box.style.width = boxStyles.width + "px";
        this.$box.style.height = boxStyles.height + "px";
        // Add 10px offset on first frame
        // which creates a subtle moving effect
        this.$box.style.transform = `translate(${boxStyles.x - 10}px,${
            boxStyles.y - 10
        }px)`;

        this._sideEffect.addDisposer(
            boxStyles$.subscribe((styles) => {
                boxStyler.set(styles);
            })
        );

        const $boxMain = document.createElement("div");
        $boxMain.className = this.wrapClassName("box-main");
        this.$box.appendChild($boxMain);

        const $titleBar = document.createElement("div");
        $titleBar.className = this.wrapClassName("titlebar-wrap");
        $titleBar.appendChild(this.titleBar.render());
        this.$titleBar = $titleBar;

        const $body = document.createElement("div");
        $body.className = this.wrapClassName("body-wrap");
        this.$body = $body;

        const $styles = document.createElement("style");
        this.$styles = $styles;
        $body.appendChild($styles);

        const $userStyles = document.createElement("style");
        this.$userStyles = $userStyles;
        $body.appendChild($userStyles);

        const $content = document.createElement("div");
        $content.className =
            this.wrapClassName("content") + " tele-fancy-scrollbar";
        this.$content = $content;
        this._sideEffect.addDisposer(
            combine(
                [this._bodyStyle$, this._defaultBoxBodyStyle$],
                ([bodyStyle, defaultBoxBodyStyle]) =>
                    bodyStyle ?? defaultBoxBodyStyle
            ).subscribe((style) => ($content.style.cssText = style || ""))
        );

        $body.appendChild($content);

        const $footer = document.createElement("div");
        $footer.className = this.wrapClassName("footer-wrap");
        this.$footer = $footer;

        $boxMain.appendChild($titleBar);

        const $main = document.createElement("div");
        $main.className = this.wrapClassName("main");
        this.$main = $main;
        $boxMain.appendChild($main);

        const $quarantineOuter = document.createElement("div");
        $quarantineOuter.className = this.wrapClassName("quarantine-outer");
        $main.appendChild($quarantineOuter);

        const $quarantine = document.createElement("div");
        $quarantine.className = this.wrapClassName("quarantine");
        $quarantine.appendChild($body);
        $quarantine.appendChild($footer);

        if (this.enableShadowDOM) {
            bindBoxStates($quarantine, "bind-quarantine-state");
            const $shadowStyle = document.createElement("style");
            $shadowStyle.textContent = shadowStyles;
            $quarantine.insertBefore($shadowStyle, $quarantine.firstChild);
            const shadow = $quarantineOuter.attachShadow({ mode: "open" });
            shadow.appendChild($quarantine);
        } else {
            $quarantineOuter.appendChild($quarantine);
        }

        this._renderResizeHandlers();

        const updateBodyRect = (): void => {
            const rect = $body.getBoundingClientRect();
            this._bodyRect$.setValue({
                x: 0,
                y: 0,
                width: rect.width,
                height: rect.height,
            });
        };
        this._sideEffect.add(() => {
            const observer = new ResizeObserver(() => {
                if (!this.minimized) {
                    updateBodyRect();
                }
            });
            observer.observe($body);
            return () => observer.disconnect();
        });
        this._sideEffect.addDisposer(
            this._minimized$.reaction((minimized) => {
                // correct content size when restoring from minimized
                if (!minimized) {
                    this._sideEffect.setTimeout(
                        updateBodyRect,
                        400,
                        "minimized-content-rect-fix"
                    );
                }
            })
        );

        return this.$box;
    }

    private _renderStage(): HTMLDivElement {
        const $stage = document.createElement("div");

        $stage.className = this.wrapClassName("box-stage");
        const updateStageRect = (stageRect: TeleBoxRect): void => {
            $stage.style.top = stageRect.y + "px";
            $stage.style.left = stageRect.x + "px";
            $stage.style.width = stageRect.width + "px";
            $stage.style.height = stageRect.height + "px";
        };
        this._sideEffect.addDisposer(
            [
                combine(
                    [this._stageStyle$, this._defaultBoxStageStyle$],
                    ([stageStyle, defaultBoxStageStyle]) =>
                        stageStyle ?? defaultBoxStageStyle
                ).subscribe((styles) => {
                    $stage.style.cssText = styles || "";
                    updateStageRect(this._stageRect$.value);
                }),
                this._stageRect$.subscribe(updateStageRect),
            ],
            "box-stage-styles"
        );
        return $stage;
    }

    private _handleTrackStart?: (ev: PointerEvent) => void;

    public handleTrackStart: (ev: PointerEvent) => void = (ev) => {
        return this._handleTrackStart?.(ev);
    };

    private _renderResizeHandlers(): void {
        const $resizeHandles = document.createElement("div");
        $resizeHandles.className = this.wrapClassName("resize-handles");

        Object.values(TELE_BOX_RESIZE_HANDLE).forEach((handleType) => {
            const $handle = document.createElement("div");
            $handle.className =
                this.wrapClassName(handleType) +
                " " +
                this.wrapClassName("resize-handle");
            $handle.dataset.teleBoxHandle = handleType;

            $resizeHandles.appendChild($handle);
        });

        this.$box.appendChild($resizeHandles);

        const TRACKING_DISPOSER_ID = "handle-tracking-listener";
        const transformingClassName = this.wrapClassName("transforming");

        let $trackMask: HTMLElement | undefined;

        let trackStartX = 0;
        let trackStartY = 0;

        let trackStartWidth = 0;
        let trackStartHeight = 0;

        let trackStartPageX = 0;
        let trackStartPageY = 0;

        let trackingHandle: TeleBoxHandleType | undefined;

        const handleTracking = (ev: PointerEvent): void => {
            if (!ev.isPrimary || this.state !== TELE_BOX_STATE.Normal) {
                return;
            }

            preventEvent(ev);

            let { pageX, pageY } = ev;
            if (pageY < 0) {
                pageY = 0;
            }

            const offsetX = pageX - trackStartPageX;
            const offsetY = pageY - trackStartPageY;

            let { x: newX, y: newY } = this.pxIntrinsicCoord;
            let { width: newWidth, height: newHeight } = this.pxIntrinsicSize;

            switch (trackingHandle) {
                case TELE_BOX_RESIZE_HANDLE.North: {
                    newY = trackStartY + offsetY;
                    newHeight = trackStartHeight - offsetY;
                    break;
                }
                // eslint-disable-next-line no-fallthrough
                case TELE_BOX_RESIZE_HANDLE.South: {
                    newHeight = trackStartHeight + offsetY;
                    break;
                }
                case TELE_BOX_RESIZE_HANDLE.West: {
                    newX = trackStartX + offsetX;
                    newWidth = trackStartWidth - offsetX;
                    break;
                }
                case TELE_BOX_RESIZE_HANDLE.East: {
                    newWidth = trackStartWidth + offsetX;
                    break;
                }
                case TELE_BOX_RESIZE_HANDLE.NorthWest: {
                    newX = trackStartX + offsetX;
                    newY = trackStartY + offsetY;
                    newWidth = trackStartWidth - offsetX;
                    newHeight = trackStartHeight - offsetY;
                    break;
                }
                case TELE_BOX_RESIZE_HANDLE.NorthEast: {
                    newY = trackStartY + offsetY;
                    newWidth = trackStartWidth + offsetX;
                    newHeight = trackStartHeight - offsetY;
                    break;
                }
                case TELE_BOX_RESIZE_HANDLE.SouthEast: {
                    newWidth = trackStartWidth + offsetX;
                    newHeight = trackStartHeight + offsetY;
                    break;
                }
                case TELE_BOX_RESIZE_HANDLE.SouthWest: {
                    newX = trackStartX + offsetX;
                    newWidth = trackStartWidth - offsetX;
                    newHeight = trackStartHeight + offsetY;
                    break;
                }
                default: {
                    this.move(trackStartX + offsetX, trackStartY + offsetY);
                    return;
                }
            }

            this.transform(newX, newY, newWidth, newHeight);
        };

        const handleTrackEnd = (ev: PointerEvent): void => {
            if (!ev.isPrimary) {
                return;
            }

            trackingHandle = void 0;

            if (!$trackMask) {
                return;
            }

            preventEvent(ev);

            this.$box.classList.toggle(transformingClassName, false);

            this._sideEffect.flush(TRACKING_DISPOSER_ID);

            $trackMask.remove();
        };

        const handleTrackStart = (ev: PointerEvent): void => {
            if (!ev.isPrimary || this.readonly) {
                return;
            }

            if (
                (ev as MouseEvent).button != null &&
                (ev as MouseEvent).button !== 0
            ) {
                // Not left mouse
                return;
            }

            if (
                !this.draggable ||
                trackingHandle ||
                this.state !== TELE_BOX_STATE.Normal
            ) {
                return;
            }

            const target = ev.target as HTMLElement;
            if (target.dataset?.teleBoxHandle) {
                preventEvent(ev);

                ({ x: trackStartX, y: trackStartY } = this.pxIntrinsicCoord);
                ({ width: trackStartWidth, height: trackStartHeight } =
                    this.pxIntrinsicSize);

                ({ pageX: trackStartPageX, pageY: trackStartPageY } = ev);

                trackingHandle = target.dataset
                    .teleBoxHandle as TELE_BOX_RESIZE_HANDLE;

                if (!$trackMask) {
                    $trackMask = document.createElement("div");
                }

                const cursor = trackingHandle
                    ? this.wrapClassName(`cursor-${trackingHandle}`)
                    : "";

                $trackMask.className = this.wrapClassName(
                    `track-mask${cursor ? ` ${cursor}` : ""}`
                );

                this.$box.appendChild($trackMask);

                this.$box.classList.add(transformingClassName);

                this._sideEffect.add(() => {
                    window.addEventListener("pointermove", handleTracking, {
                        passive: false,
                    });
                    window.addEventListener("pointerup", handleTrackEnd, {
                        passive: false,
                    });
                    window.addEventListener("pointercancel", handleTrackEnd, {
                        passive: false,
                    });

                    return () => {
                        window.removeEventListener(
                            "pointermove",
                            handleTracking
                        );
                        window.removeEventListener("pointerup", handleTrackEnd);
                        window.removeEventListener(
                            "pointercancel",
                            handleTrackEnd
                        );
                    };
                }, TRACKING_DISPOSER_ID);
            }
        };

        this._handleTrackStart = handleTrackStart;

        this._sideEffect.addEventListener(
            $resizeHandles,
            "pointerdown",
            handleTrackStart,
            {},
            "box-resizeHandles-pointerdown"
        );
    }

    public async destroy(): Promise<void> {
        this.$box.remove();
        this._sideEffect.flushAll();
        this._sideEffect.flushAll();

        await this.events.emit(TELE_BOX_EVENT.Destroyed);
        this.events.clearListeners();
        this._delegateEvents.clearListeners();
    }

    /**
     * Wrap a className with namespace
     */
    public wrapClassName(className: string): string {
        return `${this.namespace}-${className}`;
    }
}

type PropKeys<K = keyof TeleBox> = K extends keyof TeleBox
    ? // eslint-disable-next-line @typescript-eslint/ban-types
      TeleBox[K] extends Function
        ? never
        : K
    : never;

export type ReadonlyTeleBox = Pick<
    TeleBox,
    | PropKeys
    | "wrapClassName"
    | "mountContent"
    | "unmountContent"
    | "mountFooter"
    | "unmountFooter"
    | "mountStage"
    | "unmountStage"
    | "mountStyles"
    | "unmountStyles"
    | "setTitle"
    | "setDraggable"
    | "setResizable"
    | "setVisible"
    | "setBoxRatio"
    | "setStageRatio"
    | "setStageStyle"
    | "setBodyStyle"
    | "handleTrackStart"
    | "onValChanged"
>;
