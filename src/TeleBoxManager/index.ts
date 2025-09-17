import EventEmitter from "eventemitter3";
import shallowequal from "shallowequal";
import type {
    TeleBoxConfig,
    TeleBoxRect,
    TeleBoxState
} from "../TeleBox/typings";
import { TeleBoxCollector } from "../TeleBoxCollector";
import { TeleBox } from "../TeleBox";
import type { ReadonlyTeleBox } from "../TeleBox";
import { TELE_BOX_EVENT, TELE_BOX_STATE } from "../TeleBox/constants";
import { TELE_BOX_MANAGER_EVENT } from "./constants";
import type {
    TeleBoxManagerConfig,
    TeleBoxManagerCreateConfig,
    TeleBoxManagerEvents,
    TeleBoxManagerQueryConfig,
    TeleBoxManagerUpdateConfig
} from "./typings";
import { MaxTitleBar } from "./MaxTitleBar";
import type {  TeleBoxColorScheme} from "..";
import { TELE_BOX_COLOR_SCHEME, TELE_BOX_DELEGATE_EVENT } from "..";
import { genUID, SideEffectManager } from "side-effect-manager";
import type { ValEnhancedResult } from "value-enhancer";
import { createSideEffectBinder, withValueEnhancer, Val } from "value-enhancer";
import { excludeFromBoth, removeByVal, uniqueByVal } from "../utils";
import { createCallbackManager } from "./utils/callbacks";
import type { CallbackManager } from "./utils/callbacks";
import type { AnyToVoidFunction } from "../schedulers";
import { AllBoxStatusInfoManager, WukongRoleManager } from "../../types";

export * from "./typings";
export * from "./constants";

type ValConfig = {
    prefersColorScheme: Val<TeleBoxColorScheme, boolean>;
    containerRect: Val<TeleBoxRect, boolean>;
    collector: Val<TeleBoxCollector | null>;
    collectorRect: Val<TeleBoxRect | undefined>;
    readonly: Val<boolean, boolean>;
    // minimized: Val<boolean, boolean>
    // maximized: Val<boolean, boolean>
    fence: Val<boolean, boolean>;
};
export interface TeleBoxManager extends ValEnhancedResult<ValConfig> {}

export class TeleBoxManager {
    public externalEvents = new EventEmitter() as TeleBoxManagerEvents;
    public constructor({
        root = document.body,
        prefersColorScheme = TELE_BOX_COLOR_SCHEME.Light,
        // minimized = false,
        // maximized = false,
        fence = true,
        containerRect = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        },
        collector,
        namespace = "telebox",
        readonly = false,
        allBoxStatusInfoManager,
        wukongRoleManager,
    }: TeleBoxManagerConfig) {
        console.log("[TeleBox] Manager Constructor Start", {
            allBoxStatusInfoManager,
            wukongRoleManager,
            readonly,
        });
        this._sideEffect = new SideEffectManager();
        const { combine, createVal } = createSideEffectBinder(
            this._sideEffect as any
        );
        // this.callbackManager = createCallbackManager();
        // this.sizeObserver = new ResizeObserver(
        //     this.callbackManager.runCallbacks
        // );
        // this.elementObserverMap = new Map();
        this.root = root;
        this.namespace = namespace;
        this.allBoxStatusInfoManager = allBoxStatusInfoManager;
        this.wukongRoleManager = wukongRoleManager;
        this.boxes$ = createVal<TeleBox[]>([]);
        this.topBox$ = this.boxes$.derive((boxes) => {
            if (boxes.length > 0) {
                const topBox = boxes.reduce((topBox, box) =>
                    topBox.zIndex > box.zIndex ? topBox : box
                );
                return topBox;
            }
            return;
        });

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        const prefersDark$ = createVal(false);

        if (prefersDark) {
            prefersDark$.setValue(prefersDark.matches);
            this._sideEffect.add(() => {
                const handler = (evt: MediaQueryListEvent): void => {
                    prefersDark$.setValue(evt.matches);
                };
                prefersDark.addListener(handler);
                return () => prefersDark.removeListener(handler);
            });
        }

        const prefersColorScheme$ = createVal(prefersColorScheme);
        prefersColorScheme$.reaction((prefersColorScheme, _, skipUpdate) => {
            this.boxes$.value.forEach((box) =>
                box.setPrefersColorScheme(prefersColorScheme, skipUpdate)
            );
            if (!skipUpdate) {
                this.events.emit(
                    TELE_BOX_MANAGER_EVENT.PrefersColorScheme,
                    prefersColorScheme
                );
            }
        });

        this._darkMode$ = combine(
            [prefersDark$, prefersColorScheme$],
            ([prefersDark, prefersColorScheme]) =>
                prefersColorScheme === "auto"
                    ? prefersDark
                    : prefersColorScheme === "dark"
        );
        this._darkMode$.reaction((darkMode, _, skipUpdate) => {
            this.boxes$.value.forEach((box) =>
                box.setDarkMode(darkMode, skipUpdate)
            );
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.DarkMode, darkMode);
            }
        });

        const readonly$ = createVal(readonly);
        readonly$.reaction((readonly, _, skipUpdate) => {
            this.boxes$.value.forEach((box) =>
                box.setReadonly(readonly, skipUpdate)
            );
        });

        console.log("[TeleBox] Manager Constructor AllBoxStatusInfo Created", {allBoxStatusInfo: allBoxStatusInfoManager.getAllBoxStatusInfo()});
        allBoxStatusInfoManager.currentAllBoxStatusInfo$.reaction((allBoxStatusInfo, _, skipUpdate) => {
            console.log("[TeleBox] AllBoxStatusInfo Reaction Triggered", {
                allBoxStatusInfo,
                skipUpdate
            });
            const maximizedBoxes = allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized);
            const minimizedBoxes = allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized);

            // 设置box状态，但使用skipUpdate=true避免触发事件循环
            this.boxes$.value.forEach((box) => {
                const isMaximized = maximizedBoxes.includes(box.id);
                const isMinimized = minimizedBoxes.includes(box.id);
                // if(isMaximized || isMinimized){
                box.setMaximized(isMaximized, true); // 使用true来跳过事件触发
                box.setMinimized(isMinimized, true); // 使用true来跳过事件触发
                // }
            });
            //更新最大化标题栏
            this.maxTitleBar.setState(allBoxStatusInfoManager.getTeleBoxTitleBarState());

            //最小化按钮显示
            const minimized = minimizedBoxes.length > 0;
            console.log("[TeleBox] Collector Visibility Update", {
                minimized,
                minimizedBoxes
            });
            collector$.value?.setVisible(minimized);
            if (minimized) {
                if (collector$.value?.$collector) {
                    collectorRect$.setValue(calcCollectorRect());
                } else if (import.meta.env.DEV) {
                    console.warn("No collector for minimized boxes.");
                }
            }
            //设置topFocusBox
            this.makeBoxTopFromNotMinimized();
            if (!skipUpdate) {
                this.events.emit(
                    TELE_BOX_MANAGER_EVENT.AllBoxStatusInfo,
                    allBoxStatusInfo
                );
            }
        });

        this.allBoxStatusInfoManager.lastNotMinimizedBoxsStatus$.reaction(
            (lastLastNotMinimizedBoxsStatus, _, skipUpdate) => {
                if (!skipUpdate) {
                    this.events.emit(
                        TELE_BOX_MANAGER_EVENT.LastLastNotMinimizedBoxsStatus,
                        lastLastNotMinimizedBoxsStatus
                    );
                }
            }
        );

        // //  需分析下这里的逻辑，为什么需要设置combine，同时可能需要注释掉，不需要
        // //  分析结果：暂时没有发现用到的地方，暂时注释
        // const state$ = combine(
        //     [this.allBoxStatusInfo$],
        //     ([allBoxStatusInfo]): TeleBoxState => {
        //         const minimizedBoxes = this.getMinimizedBoxes(allBoxStatusInfo);
        //         const maximizedBoxes = this.getMaximizedBoxes(allBoxStatusInfo);
        //         return minimizedBoxes.length
        //             ? TELE_BOX_STATE.Minimized
        //             : maximizedBoxes.length
        //               ? TELE_BOX_STATE.Maximized
        //               : TELE_BOX_STATE.Normal;
        //     }
        // );
        // state$.reaction((state, _, skipUpdate) => {
        //     this.maxTitleBar.setState(state);
        //     if (!skipUpdate) {
        //         this.events.emit(TELE_BOX_MANAGER_EVENT.State, state);
        //     }
        // });

        const fence$ = createVal(fence);
        fence$.subscribe((fence, _, skipUpdate) => {
            this.boxes$.value.forEach((box) => box.setFence(fence, skipUpdate));
        });

        const containerRect$ = createVal(containerRect, shallowequal);
        containerRect$.reaction((containerRect, _, skipUpdate) => {
            this.boxes$.value.forEach((box) =>
                box.setContainerRect(containerRect, skipUpdate)
            );
            this.maxTitleBar.setContainerRect(containerRect);
        });

        const collector$ = createVal(
            collector === null
                ? null
                : collector ||
                      new TeleBoxCollector({
                          visible:
                              this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized).length > 0 &&
                              false !== this.wukongRoleManager?.wukongCanOperate(),
                          readonly: readonly$.value,
                          namespace,
                          boxes: this.boxes$.value,
                          externalEvents: this.externalEvents,
                          allBoxStatusInfoManager: this.allBoxStatusInfoManager,
                          wukongRoleManager: this.wukongRoleManager,
                      }).mount(root)
        );
        collector$.subscribe((collector) => {
            if (collector) {
                collector.setVisible(
                    this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized).length > 0 && !readonly$.value
                );
                collector.setReadonly(readonly$.value);
                collector.setDarkMode(this._darkMode$.value);
                this._sideEffect.add(() => {
                    collector.onClick = (boxId) => {
                        console.log("[TeleBox] Collector Click Event", {
                            boxId,
                            readonly: readonly$.value
                        });
                        if (!readonly$.value) {
                            //最小化列表中item点击,从last里面取上一次的状态进行还原
                            const lastLastNotMinimizedBoxsStatus = this.allBoxStatusInfoManager.lastNotMinimizedBoxsStatus$.value || {};
                            const lastLastNotMinimizedBoxsStatusBox = lastLastNotMinimizedBoxsStatus[boxId];
                            const allBoxStatusInfo = this.allBoxStatusInfoManager.currentAllBoxStatusInfo$.value || {};
                            if (lastLastNotMinimizedBoxsStatusBox) {
                                allBoxStatusInfo[boxId] =lastLastNotMinimizedBoxsStatusBox;
                                this.allBoxStatusInfoManager.setCurrentAllBoxStatusInfo(allBoxStatusInfo,false);
                            }
                            this.makeBoxTopFromNotMinimized(
                                this.boxes.find((item) => item.id === boxId),
                                false
                            );
                            if (
                                lastLastNotMinimizedBoxsStatusBox ===
                                TELE_BOX_STATE.Minimized
                            ) {
                                this.events.emit(
                                    TELE_BOX_MANAGER_EVENT.BoxToMinimized,
                                    { boxId, allBoxStatusInfo }
                                );
                            } else if (
                                lastLastNotMinimizedBoxsStatusBox ===
                                TELE_BOX_STATE.Maximized
                            ) {
                                this.events.emit(
                                    TELE_BOX_MANAGER_EVENT.BoxToMaximized,
                                    { boxId, allBoxStatusInfo }
                                );
                            } else if (
                                lastLastNotMinimizedBoxsStatusBox ===
                                TELE_BOX_STATE.Normal
                            ) {
                                this.events.emit(
                                    TELE_BOX_MANAGER_EVENT.BoxToNormal,
                                    { boxId, allBoxStatusInfo }
                                );
                            }
                        }
                    };
                    return () => collector.destroy();
                }, "collect-onClick");
            }
        });
        readonly$.subscribe((readonly) => {
            collector$.value?.setReadonly(readonly);
            collector$.value?.setVisible(
                this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized).length > 0 && !readonly$.value
            );
        });
        this._darkMode$.subscribe((darkMode) => {
            collector$.value?.setDarkMode(darkMode);
        });

        const calcCollectorRect = (): TeleBoxRect | undefined => {
            if (collector$.value?.$collector) {
                const { x, y, width, height } =
                    collector$.value.$collector.getBoundingClientRect();
                const rootRect = this.root.getBoundingClientRect();
                return {
                    x: x - rootRect.x,
                    y: y - rootRect.y,
                    width,
                    height
                };
            }
            return;
        };

        const collectorRect$ = createVal(
            this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized).length > 0 ? calcCollectorRect() : void 0
        );
        collectorRect$.subscribe((collectorRect, _, skipUpdate) => {
            this.boxes$.value.forEach((box) => {
                box.setCollectorRect(collectorRect, skipUpdate);
            });
        });

        const closeBtnClassName = this.wrapClassName("titlebar-icon-close");

        const checkFocusBox = (ev: MouseEvent | TouchEvent): void => {
            if (readonly$.value) {
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
                        this.focusBox(box);
                        this.makeBoxTop(box);
                        return;
                    }
                }
            }
        };

        this._sideEffect.addEventListener(
            window,
            "mousedown",
            checkFocusBox,
            true
        );
        this._sideEffect.addEventListener(
            window,
            "touchstart",
            checkFocusBox,
            true
        );

        this.maxTitleBar = new MaxTitleBar({
            darkMode: this.darkMode,
            readonly: readonly$.value,
            namespace: this.namespace,
            state: this.allBoxStatusInfoManager.getTeleBoxTitleBarState(),
            boxes: this.boxes$.value,
            containerRect: containerRect$.value,
            onEvent: (event): void => {
                if (!this.topBox?.id) {
                    return;
                }
                //当前操作的box
                const currentOptionBox = {
                    ...event,
                    boxId: this.maxTitleBar.focusedBox?.id || this.topBox?.id, //当前显示的box
                    hasFocus:
                        this.focusBox !== undefined && this.focusBox !== null //是否有获焦的Box
                };
                switch (event.type) {
                    case TELE_BOX_DELEGATE_EVENT.Maximize: {
                        console.log(
                            "[TeleBox] TitleBar Options Click To Maximize",
                            currentOptionBox
                        );
                        if (currentOptionBox.hasFocus) {
                            //当前有获焦的box，则将当前box设置为最大化，如果当前的是最大化的则设置为normal
                            const allBoxStatusInfo = this.allBoxStatusInfoManager.getAllBoxStatusInfo();
                            this.allBoxStatusInfoManager.setCurrentBoxState(currentOptionBox.boxId, TELE_BOX_STATE.Maximized ===
                                allBoxStatusInfo[currentOptionBox.boxId]
                                ? TELE_BOX_STATE.Normal
                                : TELE_BOX_STATE.Maximized, false);
                        // } else {
                        //     //如果当前没有获焦的box，则清除所有最大化状态
                        //     const allBoxStatusInfo = this.allBoxStatusInfoManager.getAllBoxStatusInfo();
                        //     Object.keys(allBoxStatusInfo).forEach((boxId) => {
                        //         if (
                        //             allBoxStatusInfo[boxId] ===
                        //             TELE_BOX_STATE.Maximized
                        //         ) {
                        //             allBoxStatusInfo[boxId] =
                        //                 TELE_BOX_STATE.Normal;
                        //         }
                        //     });
                        //     this.setAllBoxStatusInfo(allBoxStatusInfo, false);
                        }
                        this.events.emit(
                            TELE_BOX_MANAGER_EVENT.BoxToMaximized,
                            {
                                boxId: currentOptionBox.boxId,
                                allBoxStatusInfo:
                                    this.allBoxStatusInfoManager.getAllBoxStatusInfo()
                            }
                        );
                        break;
                    }
                    case TELE_BOX_DELEGATE_EVENT.Minimize: {
                        console.log(
                            "[TeleBox] TitleBar Options Click To Minimize",
                            currentOptionBox
                        );
                        if (currentOptionBox.hasFocus) {
                            //当前有获焦的box，则将当前box设置为最大化，如果当前的是最大化的则设置为normal
                            this.changeBoxToMinimized(currentOptionBox.boxId);
                        // } else {
                        //     //如果当前没有获焦的box，则清除所有最大化状态
                        //     const allBoxStatusInfo = {
                        //         ...(this.allBoxStatusInfo$.value || {})
                        //     };
                        //     Object.keys(allBoxStatusInfo).forEach((boxId) => {
                        //         if (
                        //             allBoxStatusInfo[boxId] ===
                        //             TELE_BOX_STATE.Maximized
                        //         ) {
                        //             allBoxStatusInfo[boxId] =
                        //                 TELE_BOX_STATE.Normal;
                        //         }
                        //     });
                        //     this.setAllBoxStatusInfo(allBoxStatusInfo, false);
                        }
                        this.events.emit(
                            TELE_BOX_MANAGER_EVENT.BoxToMinimized,
                            {
                                boxId: currentOptionBox.boxId,
                                allBoxStatusInfo:
                                    this.allBoxStatusInfoManager.getAllBoxStatusInfo()
                            }
                        );
                        break;
                    }
                    case TELE_BOX_EVENT.Close: {
                        console.log(
                            "[TeleBox] TitleBar Options Click To Close",
                            currentOptionBox
                        );
                        //内部有更新
                        this.remove(currentOptionBox.boxId, false);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            },
            allBoxStatusInfoManager: this.allBoxStatusInfoManager,
            wukongRoleManager: this.wukongRoleManager,
        });
        readonly$.subscribe((readonly) =>
            this.maxTitleBar.setReadonly(readonly)
        );
        this._darkMode$.subscribe((darkMode) => {
            this.maxTitleBar.setDarkMode(darkMode);
        });
        this.boxes$.reaction((boxes) => {
            this.maxTitleBar.setBoxes(boxes);
            this.collector?.setBoxes(boxes);
        });

        const valConfig: ValConfig = {
            prefersColorScheme: prefersColorScheme$,
            containerRect: containerRect$,
            collector: collector$,
            collectorRect: collectorRect$,
            readonly: readonly$,
            fence: fence$,
        };

        withValueEnhancer(this, valConfig);

        // this._state$ = state$;

        this.root.appendChild(this.maxTitleBar.render());
    }

    public get boxes(): ReadonlyArray<TeleBox> {
        return this.boxes$.value;
    }

    public get topBox(): TeleBox | undefined {
        return this.topBox$.value;
    }

    public readonly events = new EventEmitter() as TeleBoxManagerEvents;

    protected _sideEffect: SideEffectManager;
    // protected sizeObserver: ResizeObserver;
    // protected callbackManager: CallbackManager;
    // protected elementObserverMap: Map<
    //     string,
    //     { el: HTMLElement; cb: AnyToVoidFunction }[]
    // >;

    protected root: HTMLElement;

    public readonly namespace: string;
    /** AllBoxStatusInfoManager Instance. */
    protected allBoxStatusInfoManager: AllBoxStatusInfoManager;
    protected wukongRoleManager: WukongRoleManager;

    public _darkMode$: Val<boolean, boolean>;

    public get darkMode(): boolean {
        return this._darkMode$.value;
    }

    // public _state$: Val<TeleBoxState, boolean>;

    // public get state(): TeleBoxState {
    //     return this._state$.value;
    // }

    public setMinimized(data: boolean, skipUpdate = false): void {
        console.log("[TeleBox] SetMinimized Called", { data, skipUpdate });
        // const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
        // if (data) {
        //     // 将所有boxes设置为最小化
        //     this.boxes$.value.forEach(box => {
        //         allBoxStatusInfo[box.id] = TELE_BOX_STATE.Minimized
        //     })
        // } else {
        //     // 清除所有最小化状态
        //     Object.keys(allBoxStatusInfo).forEach(boxId => {
        //         if (allBoxStatusInfo[boxId] === TELE_BOX_STATE.Minimized) {
        //             allBoxStatusInfo[boxId] = TELE_BOX_STATE.Normal
        //         }
        //     })
        // }
        // this.setAllBoxStatusInfo(allBoxStatusInfo)
    }

    public setMaximized(data: boolean, skipUpdate = false): void {
        console.log("[TeleBox] SetMaximized Called", { data, skipUpdate });
        // const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
        // if (data) {
        //     // 将所有boxes设置为最大化
        //     this.boxes$.value.forEach(box => {
        //         allBoxStatusInfo[box.id] = TELE_BOX_STATE.Maximized
        //     })
        // } else {
        //     // 清除所有最大化状态
        //     Object.keys(allBoxStatusInfo).forEach(boxId => {
        //         if (allBoxStatusInfo[boxId] === TELE_BOX_STATE.Maximized) {
        //             allBoxStatusInfo[boxId] = TELE_BOX_STATE.Normal
        //         }
        //     })
        // }
        // this.setAllBoxStatusInfo(allBoxStatusInfo)
    }


    /** @deprecated use setMaximized and setMinimized instead */
    public setState(state: TeleBoxState, skipUpdate = false): this {
        console.log(skipUpdate);
        switch (state) {
            case TELE_BOX_STATE.Maximized: {
                // this.setMinimized(false, skipUpdate)
                // this.setMaximized(true, skipUpdate)
                break;
            }
            case TELE_BOX_STATE.Minimized: {
                // this.setMinimized(true, skipUpdate)
                // this.setMaximized(false, skipUpdate)
                break;
            }
            default: {
                // this.setMinimized(false, skipUpdate)
                // this.setMaximized(false, skipUpdate)
                break;
            }
        }
        return this;
    }

    public create(
        config: TeleBoxManagerCreateConfig,
        smartPosition = true
    ): ReadonlyTeleBox {
        const id = config.id || genUID();

        const state =this.allBoxStatusInfoManager.getAllBoxStatusInfo()[id]
        console.log("[TeleBox] Create Box State",id, state)

        const box = new TeleBox({
            zIndex: this.topBox ? this.topBox.zIndex + 1 : 100,
            ...(smartPosition ? this.smartPosition(config) : config),
            darkMode: this.darkMode,
            prefersColorScheme: this.prefersColorScheme,
            //全部都是默认nomal方式
            maximized: TELE_BOX_STATE.Maximized === state,
            minimized: TELE_BOX_STATE.Minimized === state,
            fence: this.fence,
            namespace: this.namespace,
            containerRect: this.containerRect,
            readonly: this.readonly,
            collectorRect: this.collectorRect,
            id,
            allBoxStatusInfoManager: this.allBoxStatusInfoManager,
            wukongRoleManager: this.wukongRoleManager,
            // todo 需分析下这里的逻辑，为什么需要设置addObserver
            addObserver: (el: HTMLElement, cb: ResizeObserverCallback) => {
                // const observer = this.elementObserverMap.get(id);

                // if (!observer) {
                //     this.elementObserverMap.set(id, [{ el, cb }]);
                // } else {
                //     observer.push({ el, cb });
                // }

                // this.callbackManager.addCallback(cb);
                // this.sizeObserver.observe(el);
            }
        });

        box.mount(this.root);

        if (box.focus) {
            this.focusBox(box);
            if (smartPosition) {
                this.makeBoxTop(box);
            }
        }

        this.boxes$.setValue([...this.boxes, box]);
        //更新allBoxStatusInfo，确保新创建的box状态被记录
        if (!state){
            this.allBoxStatusInfoManager.setCurrentAllBoxStatusInfo({...this.allBoxStatusInfoManager.getAllBoxStatusInfo(), [id]: state || TELE_BOX_STATE.Normal}, false);
        }
        console.log("[TeleBox] Create Box AllBoxStatusInfo UpdateFinish", this.allBoxStatusInfoManager.getAllBoxStatusInfo())

        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Maximize, () => {
            console.log("[TeleBox] TitleBar Maximize From Box Event", {
                boxId: box.id
            });
            //把所有非最小化的都最大化，同时设置当前box为topBox
            const allBoxStatusInfo = this.allBoxStatusInfoManager.getAllBoxStatusInfo();
            Object.entries(allBoxStatusInfo).forEach(([boxId, state]) => {
                if (state !== TELE_BOX_STATE.Minimized) {
                    allBoxStatusInfo[boxId] = TELE_BOX_STATE.Maximized;
                }
            });
            this.allBoxStatusInfoManager.setCurrentAllBoxStatusInfo(allBoxStatusInfo, false);
            this.events.emit(TELE_BOX_MANAGER_EVENT.BoxToMaximized, {
                boxId: box.id,
                allBoxStatusInfo: this.allBoxStatusInfoManager.getAllBoxStatusInfo()
            });
        });
        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Minimize, () => {
            console.log("[TeleBox] TitleBar Minimize From Box Event", {
                boxId: box.id
            });
            this.changeBoxToMinimized(box.id);
            this.events.emit(TELE_BOX_MANAGER_EVENT.BoxToMinimized, {
                boxId: box.id,
                allBoxStatusInfo: this.allBoxStatusInfoManager.getAllBoxStatusInfo()
            });
        });
        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Close, () => {
            console.log("[TeleBox] TitleBar Close From Box Event", {
                boxId: box.id
            });
            this.remove(box.id, false);
            this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, [box]);
        });
        box._coord$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.Move, box);
            }
        });
        box._size$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.Resize, box);
            }
        });
        box._intrinsicCoord$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicMove, box);
            }
        });
        box._intrinsicSize$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicResize, box);
            }
        });
        box._visualSize$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.VisualResize, box);
            }
        });
        box._zIndex$.reaction((_, __, skipUpdate) => {
            console.log(
                "[TeleBox] Current Box ZIndex ",
                box.id,
                box.zIndex,
                " Original ZIndex ",
                box.zIndex
            );
            if (this.boxes.length > 0) {
                const topBox = this.boxes.reduce((topBox, box) =>
                    topBox.zIndex > box.zIndex ? topBox : box
                );
                this.topBox$.setValue(topBox);
            }
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.ZIndex, box);
            }
            const list = this.boxes$.value
                .filter((item) => this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized).includes(item.id))
                .sort((a, b) => b.zIndex - a.zIndex);
            if (list && list.length > 0) {
                this.maxTitleBar.setIndexZ(list[0].zIndex + 1);
            }
        });
        this.events.emit(TELE_BOX_MANAGER_EVENT.Created, box);

        return box;
    }

    //修改box为最小化
    private changeBoxToMinimized(boxId: string): void {
        this.allBoxStatusInfoManager.setLastNotMinimizedBoxState(boxId, this.allBoxStatusInfoManager.getAllBoxStatusInfo()[boxId], false);
        this.allBoxStatusInfoManager.setCurrentBoxState(boxId, TELE_BOX_STATE.Minimized, false);
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
        this.boxes$.value.forEach((box) => {
            this.updateBox(box, config, skipUpdate);
        });
    }

    public remove(
        boxOrID: string | TeleBox,
        skipUpdate = false
    ): ReadonlyTeleBox | undefined {
        console.log("[TeleBox] Remove Method Called", { boxOrID, skipUpdate });
        const index = this.getBoxIndex(boxOrID);
        if (index >= 0) {
            // 在删除box之前获取boxId
            const boxId = typeof boxOrID === "string" ? boxOrID : boxOrID.id;
            const boxes = this.boxes.slice();
            const deletedBoxes = boxes.splice(index, 1);
            this.boxes$.setValue(boxes);
            deletedBoxes.forEach((box) => box.destroy());
            if (boxId) {
                this.allBoxStatusInfoManager.removeCurrentBoxState(boxId, skipUpdate);
                this.allBoxStatusInfoManager.removeLastNotMinimizedBoxState(boxId, skipUpdate);
                // const observeData = this.elementObserverMap.get(boxId);
                // if (observeData) {
                //     observeData.forEach(({ el, cb }) => {
                //         this.callbackManager.removeCallback(cb);
                //         this.sizeObserver.unobserve(el);
                //         this.elementObserverMap.delete(boxId);
                //     });
                // }
            }
            if (!skipUpdate) {
                if (this.boxes.length <= 0) {
                    this.allBoxStatusInfoManager.clearCurrentAllBoxStatusInfo(skipUpdate);
                    this.allBoxStatusInfoManager.clearLastNotMinimizedBoxsStatus(skipUpdate);
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
        console.log("[TeleBox] RemoveAll Method Called", {
            skipUpdate,
            boxCount: this.boxes$.value.length
        });
        const deletedBoxes = this.boxes$.value;
        this.boxes$.setValue([]);
        deletedBoxes.forEach((box) => box.destroy());
        // this.sizeObserver.disconnect();
        // this.elementObserverMap = new Map();
        // this.callbackManager.removeAll();
        if (!skipUpdate) {
            if (this.boxes.length <= 0) {
                console.log(
                    "[TeleBox] RemoveAll - No Boxes Left, Clearing Arrays"
                );
                this.allBoxStatusInfoManager.clearCurrentAllBoxStatusInfo(skipUpdate);
                this.allBoxStatusInfoManager.clearLastNotMinimizedBoxsStatus(skipUpdate);
            }
            console.log(
                "[TeleBox] RemoveAll - Emitting Removed Event",
                deletedBoxes
            );
            this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes);
        }
        return deletedBoxes;
    }

    public destroy(skipUpdate = false): void {
        this.events.removeAllListeners();
        this._sideEffect.flushAll();
        this.removeAll(skipUpdate);
        // this.sizeObserver.disconnect();
        // this.callbackManager.removeAll();
        Object.keys(this).forEach((key) => {
            const value = this[key as keyof this];
            if (value instanceof Val) {
                value.destroy();
            }
        });
    }

    public wrapClassName(className: string): string {
        return `${this.namespace}-${className}`;
    }

    public focusBox(boxOrID: string | TeleBox, skipUpdate = false): void {
        console.log("[TeleBox] FocusBox Called", { boxOrID, skipUpdate });
        const targetBox = this.getBox(boxOrID);
        if (targetBox) {
            this.boxes$.value.forEach((box) => {
                if (targetBox === box) {
                    let focusChanged = false;
                    if (!targetBox.focus) {
                        focusChanged = true;
                        targetBox.setFocus(true, skipUpdate);
                    }
                    if (focusChanged && !skipUpdate) {
                        this.events.emit(
                            TELE_BOX_MANAGER_EVENT.Focused,
                            targetBox
                        );
                    }
                } else if (box.focus) {
                    // if (!this.maximizedBoxes$.value.includes(box.id)) {

                    // }
                    this.blurBox(box, skipUpdate);
                }
            });
            const maximizedBoxes = this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized);
            if (maximizedBoxes.length > 0) {
                if (maximizedBoxes.includes(targetBox.id)) {
                    console.log(
                        "[TeleBox] FocusBox - MaxTitleBar Focus (Maximized Box)",
                        { targetBoxId: targetBox.id }
                    );
                    this.maxTitleBar.focusBox(targetBox);
                }
            } else {
                console.log(
                    "[TeleBox] FocusBox - MaxTitleBar Focus (No Maximized Boxes)",
                    { targetBoxId: targetBox.id }
                );
                this.maxTitleBar.focusBox(targetBox);
            }
        }
    }

    public focusTopBox(): void {
        console.log("[TeleBox] FocusTopBox Called", {
            topBox: this.topBox?.id,
            topBoxFocus: this.topBox?.focus
        });
        if (this.topBox && !this.topBox.focus) {
            console.log("[TeleBox] FocusTopBox - Focusing Top Box", {
                topBox: this.topBox.id
            });
            return this.focusBox(this.topBox);
        }
    }

    public blurBox(boxOrID: string | TeleBox, skipUpdate = false): void {
        const targetBox = this.getBox(boxOrID);
        if (targetBox) {
            if (targetBox.focus) {
                targetBox.setFocus(false, skipUpdate);
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, targetBox);
                }
            }
            // todo 需分析下这里的逻辑，为什么需要设置focusBox.得是最大化的box才可以focus，
            // 已修改为下面的代码
            // if (this.maxTitleBar.focusedBox === targetBox) {
                // this.maxTitleBar.focusBox()
            // }
            const maximizedBoxes = this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized);
            if (maximizedBoxes.length > 0) {
                if (maximizedBoxes.includes(targetBox.id)) {
                    this.maxTitleBar.focusBox(targetBox);
                }
            }
        }
    }

    public blurAll(skipUpdate = false): void {
        this.boxes$.value.forEach((box) => {
            if (box.focus) {
                box.setFocus(false, skipUpdate);
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, box);
                }
            }
        });
        if (this.maxTitleBar.focusedBox) {
            this.maxTitleBar.focusBox();
        }
    }

    public setScaleContent(appId: string, scale: number): void {
        const box = this.boxes.find((item) => item.id == appId);

        if (box) {
            box.setScaleContent(scale);
        }
    }

    protected maxTitleBar: MaxTitleBar;

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
        console.log("[TeleBox] UpdateBox Method Called", {
            boxId: box.id,
            config,
            skipUpdate
        });
        if (config.x != null || config.y != null) {
            box.move(
                config.x == null ? box.intrinsicX : config.x,
                config.y == null ? box.intrinsicY : config.y,
                skipUpdate
            );
        }
        if (config.width != null || config.height != null) {
            box.resize(
                config.width == null ? box.intrinsicWidth : config.width,
                config.height == null ? box.intrinsicHeight : config.height,
                skipUpdate
            );
        }
        if (config.title != null) {
            box.setTitle(config.title);
            this.maxTitleBar.updateTitles();
        }
        if (config.visible != null) {
            box.setVisible(config.visible, skipUpdate);
        }
        if (config.minHeight != null) {
            box.setMinHeight(config.minHeight, skipUpdate);
        }
        if (config.minWidth != null) {
            box.setMinWidth(config.minWidth, skipUpdate);
        }
        if (config.resizable != null) {
            box.setResizable(config.resizable, skipUpdate);
        }
        if (config.draggable != null) {
            box.setDraggable(config.draggable, skipUpdate);
        }
        if (config.fixRatio != null) {
            box.setFixRatio(config.fixRatio, skipUpdate);
        }
        if (config.zIndex != null) {
            box.setZIndex(config.zIndex, skipUpdate);
        }
        if (config.content != null) {
            box.mountContent(config.content);
        }
        if (config.footer != null) {
            box.mountFooter(config.footer);
        }
        if (box.id?.includes("audio")) {
            console.log("[TeleBox] UpdateBox - Audio Box Special Handling", {
                boxId: box.id
            });
            box.setMaximized(true, skipUpdate);
            box.setMinimized(false, skipUpdate);
        } else {
            console.log("[TeleBox] UpdateBox - Regular Box Config", config);
            if (config.maximized != null) {
                console.log("[TeleBox] UpdateBox - Setting Maximized", {
                    boxId: box.id,
                    maximized: config.maximized,
                    skipUpdate
                });
                box.setMaximized(config.maximized, skipUpdate);
            }
            if (config.minimized != null) {
                console.log("[TeleBox] UpdateBox - Setting Minimized", {
                    boxId: box.id,
                    minimized: config.minimized,
                    skipUpdate
                });
                box.setMinimized(config.minimized, skipUpdate);
            }
            // box.setMaximized(!!config.maximized, skipUpdate)
            // box.setMinimized(!!config.minimized, skipUpdate)
        }
    }

    protected smartPosition(config: TeleBoxConfig): TeleBoxConfig {
        let { x, y } = config;
        const { width = 0.5, height = 0.5 } = config;

        if (x == null) {
            let vx = 20;
            if (this.topBox) {
                vx = this.topBox.intrinsicX * this.containerRect.width + 20;

                if (
                    vx >
                    this.containerRect.width - width * this.containerRect.width
                ) {
                    vx = 20;
                }
            }
            x = vx / this.containerRect.width;
        }

        if (y == null) {
            let vy = 20;

            if (this.topBox) {
                vy = this.topBox.intrinsicY * this.containerRect.height + 20;

                if (
                    vy >
                    this.containerRect.height -
                        height * this.containerRect.height
                ) {
                    vy = 20;
                }
            }

            y = vy / this.containerRect.height;
        }

        return { ...config, x, y, width, height };
    }

    protected makeBoxTop(box: TeleBox, skipUpdate = false): void {
        console.log(
            "[TeleBox] TopBox Change To",
            box.id,
            box.zIndex,
            " Original TopBox ",
            this.topBox?.id,
            this.topBox?.zIndex
        );
        if (this.topBox) {
            if (box !== this.topBox) {
                const maximizedBoxes = this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized);
                if (maximizedBoxes.includes(box.id)) {
                    const minimizedBoxes = this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized);
                    const newIndex = this.topBox.zIndex + 1;

                    const normalBoxesIds = excludeFromBoth(
                        this.boxes$.value.map((item) => item.id),
                        maximizedBoxes,
                        minimizedBoxes
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

    // 从非最小化的boxes中找到zIndex最大的box
    public makeBoxTopFromNotMinimized(
        topFocusBox: TeleBox | undefined = undefined,
        skipUpdate = false
    ): void {
        console.log("[TeleBox] MakeBoxTopFromNotMinimized Called", {
            topFocusBox: topFocusBox?.id,
            skipUpdate
        });
        if (!topFocusBox) {
            const allBoxStatusInfo = this.allBoxStatusInfoManager.getAllBoxStatusInfo();
            const notMinimizedBoxes = Object.entries(allBoxStatusInfo)
                .filter(([_, state]) => state !== TELE_BOX_STATE.Minimized)
                .map(([boxId, _]) => boxId);
            const filteredBoxes = this.boxes.filter((box: TeleBox) =>
                notMinimizedBoxes.includes(box.id)
            );
            if (filteredBoxes.length > 0) {
                topFocusBox = filteredBoxes.reduce((maxBox, box) => {
                    return maxBox.zIndex > box.zIndex ? maxBox : box;
                });
            }
        }

        // 如果没有找到topFocusBox，直接返回
        if (!topFocusBox) {
            console.log("[TeleBox] No topFocusBox found, returning early");
            return;
        }

        this.makeBoxTop(topFocusBox, skipUpdate);
        const allBoxStatusInfo = this.allBoxStatusInfoManager.getAllBoxStatusInfo();
        if (allBoxStatusInfo[topFocusBox.id] === TELE_BOX_STATE.Maximized) {
            this.maxTitleBar.focusBox(topFocusBox);
        } else {
            const maximizedBoxes = this.boxes.filter(
                (box: TeleBox) =>
                    allBoxStatusInfo[box.id] === TELE_BOX_STATE.Maximized
            );
            if (maximizedBoxes.length > 0) {
                const maxBox = maximizedBoxes.reduce((maxBox, box) => {
                    return maxBox.zIndex > box.zIndex ? maxBox : box;
                });
                this.maxTitleBar.focusBox(maxBox);
            }
        }
        if (!skipUpdate) {
            this.events.emit(TELE_BOX_MANAGER_EVENT.ZIndex, topFocusBox);
        }
        const list = this.boxes$.value
            .filter((item) => this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized).includes(item.id))
            .sort((a, b) => b.zIndex - a.zIndex);
        if (list && list.length > 0) {
            this.maxTitleBar.setIndexZ(list[0].zIndex + 1);
        }
    }

    public makeBoxTopFromMaximized(boxId?: string): boolean {
        const maximizedBoxes = this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Maximized);
        const minimizedBoxes = this.allBoxStatusInfoManager.getBoxesList(TELE_BOX_STATE.Minimized);
        console.log("[TeleBox] MakeBoxTopFromMaximized Called", {
            boxId,
            currentMaximized: maximizedBoxes,
            currentMinimized: minimizedBoxes
        });
        let maxIndexBox = undefined;
        if (boxId) {
            if (
                maximizedBoxes.includes(boxId) &&
                !minimizedBoxes.includes(boxId)
            ) {
                maxIndexBox = this.boxes$.value.find((box) => box.id === boxId);
                console.log(
                    "[TeleBox] MakeBoxTopFromMaximized - Found Specific Box",
                    { boxId, maxIndexBox: maxIndexBox?.id }
                );
            }
        } else {
            const allBoxStatusInfo = this.allBoxStatusInfoManager.getAllBoxStatusInfo();
            const maximizedBoxes = this.boxes?.filter(
                (box: TeleBox) =>
                    allBoxStatusInfo[box.id] === TELE_BOX_STATE.Maximized
            );
            if (maximizedBoxes && maximizedBoxes.length > 0) {
                maxIndexBox = maximizedBoxes.reduce((maxBox, box) => {
                    return maxBox.zIndex > box.zIndex ? maxBox : box;
                });
                if (maxIndexBox) {
                    console.log(
                        "[TeleBox] MakeBoxTopFromMaximized - Focusing Max Index Box",
                        { maxIndexBox: maxIndexBox.id }
                    );
                    this.maxTitleBar.focusBox(maxIndexBox);
                }
            }
        }

        const result = !!maxIndexBox;
        console.log("[TeleBox] MakeBoxTopFromMaximized Result", {
            result,
            maxIndexBox: maxIndexBox?.id
        });
        return result;
    }
    protected getBoxIndex(boxOrID: TeleBox | string): number {
        return typeof boxOrID === "string"
            ? this.boxes.findIndex((box) => box.id === boxOrID)
            : this.boxes.findIndex((box) => box === boxOrID);
    }

    public setMaxTitleFocus(boxOrID: TeleBox | string): void {
        !!this.getBox(boxOrID) &&
            this.maxTitleBar.focusBox(this.getBox(boxOrID));
    }

    protected getBox(boxOrID: TeleBox | string): TeleBox | undefined {
        return typeof boxOrID === "string"
            ? this.boxes.find((box) => box.id === boxOrID)
            : boxOrID;
    }
}
