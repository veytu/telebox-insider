declare type SideEffectDisposer = () => void;
declare class SideEffectManager {
    /**
     * Add a side effect.
     * @param executor execute side effect
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    add(executor: () => SideEffectDisposer, disposerID?: string): string;
    /**
     * Add a disposer directly.
     * @param disposer a disposer
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    addDisposer(disposer: SideEffectDisposer, disposerID?: string): string;
    /**
     * Sugar for addEventListener.
     * @param el
     * @param type
     * @param listener
     * @param options
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    addEventListener<K extends keyof WindowEventMap>(el: Window, type: K, listener: (this: Window, ev: WindowEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    addEventListener<K extends keyof DocumentEventMap>(el: Document, type: K, listener: (this: Document, ev: DocumentEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    addEventListener<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions, disposerID?: string): string;
    /**
     * Sugar for setTimeout.
     * @param handler
     * @param timeout
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    setTimeout(handler: () => void, timeout: number, disposerID?: string): string;
    /**
     * Sugar for setInterval.
     * @param handler
     * @param timeout
     * @param disposerID Optional id for the disposer
     * @returns disposerID
     */
    setInterval(handler: () => void, timeout: number, disposerID?: string): string;
    /**
     * Remove but not run the disposer. Do nothing if not found.
     * @param disposerID
     */
    remove(disposerID: string): SideEffectDisposer | undefined;
    /**
     * Remove and run the disposer. Do nothing if not found.
     * @param disposerID
     */
    flush(disposerID: string): void;
    /**
     * Remove and run all of the disposers.
     */
    flushAll(): void;
    /**
     * All disposers. Use this only when you know what you are doing.
     */
    readonly disposers: Map<string, SideEffectDisposer>;
}

declare type ValCompare<TValue = any> = (newValue: TValue, oldValue: TValue) => boolean;
declare type ValReactionSubscriber<TValue = any, TMeta = any> = (newValue: TValue, oldValue: TValue, meta?: TMeta) => void;
declare type ValSubscriber<TValue = any, TMeta = any> = (newValue: TValue, oldValue: TValue | undefined, meta?: TMeta) => void;
declare type ValTransform<TValue = any, TDerivedValue = any, TMeta = any> = (newValue: TValue, oldValue: TValue | undefined, meta?: TMeta) => TDerivedValue;
declare type ValDisposer = () => void;

declare class Val<TValue = any, TMeta = any> {
    protected _value: TValue;
    constructor(value: TValue, compare?: ValCompare<TValue>);
    get value(): TValue;
    setValue(value: TValue, meta?: TMeta): void;
    /**
     * Subscribe to value changes without immediate emission.
     */
    reaction(subscriber: ValReactionSubscriber<TValue, TMeta>): ValDisposer;
    /**
     * Subscribe to value changes with immediate emission.
     * @param subscriber
     * @param meta Meta for the immediate emission
     */
    subscribe(subscriber: ValSubscriber<TValue, TMeta>, meta?: TMeta): ValDisposer;
    derive<TDerivedValue = any>(transform: ValTransform<TValue, TDerivedValue, TMeta>, compare?: ValCompare<TDerivedValue>, meta?: TMeta): Val<TDerivedValue, TMeta>;
    destroy(): void;
    /**
     * Add a callback which will be run before destroy
     * @param beforeDestroy
     * @returns Cancel the callback
     */
    addBeforeDestroy(beforeDestroy: () => void): ValDisposer;
    /**
     * Compare two values. Default `===`.
     */
    compare(newValue: TValue, oldValue: TValue): boolean;
    protected _beforeDestroys?: Set<() => void>;
    protected _subscribers?: Set<ValSubscriber<TValue, TMeta> | ValReactionSubscriber<TValue, TMeta>>;
}

declare type TValInputsValueTuple<TValInputs extends readonly Val[]> = Readonly<{
    [K in keyof TValInputs]: ExtractValValue<TValInputs[K]>;
}>;
declare type ExtractValValue<TVal> = TVal extends Val<infer TValue, any> ? TValue : never;
declare type ExtractValMeta<TVal> = TVal extends Val<any, infer TMeta> ? TMeta : never;
declare type CombineValTransform<TDerivedValue = any, TValues extends readonly any[] = any[], TMeta = any> = (newValues: TValues, oldValues?: TValues, meta?: TMeta) => TDerivedValue;
declare type Combine = <TDerivedValue = any, TValInputs extends readonly Val[] = Val[], TMeta = ExtractValMeta<TValInputs[number]>>(valInputs: readonly [...TValInputs], transform: CombineValTransform<TDerivedValue, [
    ...TValInputsValueTuple<TValInputs>
], TMeta>, compare?: ValCompare<TDerivedValue>, meta?: TMeta) => Val<TDerivedValue, TMeta>;

declare type IntersectionFromUnion<TUnion> = (TUnion extends any ? (arg: TUnion) => void : never) extends (arg: infer TArg) => void ? TArg : never;
declare type ExtractValKeys<TInstance, TKey = keyof TInstance> = TKey extends Extract<keyof TInstance, string> ? TInstance[TKey] extends Val ? TKey : never : never;
declare type ValEnhancer<TVal, TKey extends string> = Readonly<Record<TKey, ExtractValValue<TVal>> & Record<`_${TKey}$`, TVal> & Record<`set${Capitalize<TKey>}`, (value: ExtractValValue<TVal>, meta?: ExtractValMeta<TVal>) => void>>;
declare type ToValUnion<TConfig, TKey = ExtractValKeys<TConfig>> = TKey extends ExtractValKeys<TConfig> ? ValEnhancer<TConfig[TKey], TKey> : never;
declare type ValEnhancedResult<TConfig> = IntersectionFromUnion<ToValUnion<TConfig>>;

declare type BindSideEffect = <TVal extends Val>(val: TVal) => TVal;
declare type CreateVal = <TValue = any, TMeta = any>(value: TValue, compare?: ValCompare<TValue>) => Val<TValue, TMeta>;
declare type ValSideEffectBinder = {
    bindSideEffect: BindSideEffect;
    combine: Combine;
    createVal: CreateVal;
};

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 */
declare class EventEmitter<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol,
  Context extends any = any
> {
  static prefixed: string | boolean;

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   */
  eventNames(): Array<EventEmitter.EventNames<EventTypes>>;

  /**
   * Return the listeners registered for a given event.
   */
  listeners<T extends EventEmitter.EventNames<EventTypes>>(
    event: T
  ): Array<EventEmitter.EventListener<EventTypes, T>>;

  /**
   * Return the number of listeners listening to a given event.
   */
  listenerCount(event: EventEmitter.EventNames<EventTypes>): number;

  /**
   * Calls each of the listeners registered for a given event.
   */
  emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ): boolean;

  /**
   * Add a listener for a given event.
   */
  on<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: Context
  ): this;
  addListener<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: Context
  ): this;

  /**
   * Add a one-time listener for a given event.
   */
  once<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn: EventEmitter.EventListener<EventTypes, T>,
    context?: Context
  ): this;

  /**
   * Remove the listeners of a given event.
   */
  removeListener<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean
  ): this;
  off<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    fn?: EventEmitter.EventListener<EventTypes, T>,
    context?: Context,
    once?: boolean
  ): this;

  /**
   * Remove all listeners, or those of the specified event.
   */
  removeAllListeners(event?: EventEmitter.EventNames<EventTypes>): this;
}

declare namespace EventEmitter {
  export interface ListenerFn<Args extends any[] = any[]> {
    (...args: Args): void;
  }

  export interface EventEmitterStatic {
    new <
      EventTypes extends ValidEventTypes = string | symbol,
      Context = any
    >(): EventEmitter<EventTypes, Context>;
  }

  /**
   * `object` should be in either of the following forms:
   * ```
   * interface EventTypes {
   *   'event-with-parameters': any[]
   *   'event-with-example-handler': (...args: any[]) => void
   * }
   * ```
   */
  export type ValidEventTypes = string | symbol | object;

  export type EventNames<T extends ValidEventTypes> = T extends string | symbol
    ? T
    : keyof T;

  export type ArgumentMap<T extends object> = {
    [K in keyof T]: T[K] extends (...args: any[]) => void
      ? Parameters<T[K]>
      : T[K] extends any[]
      ? T[K]
      : any[];
  };

  export type EventListener<
    T extends ValidEventTypes,
    K extends EventNames<T>
  > = T extends string | symbol
    ? (...args: any[]) => void
    : (
        ...args: ArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]
      ) => void;

  export type EventArgs<
    T extends ValidEventTypes,
    K extends EventNames<T>
  > = Parameters<EventListener<T, K>>;

  export const EventEmitter: EventEmitterStatic;
}

declare enum TELE_BOX_COLOR_SCHEME {
    Light = "light",
    Dark = "dark",
    Auto = "auto"
}
declare enum TELE_BOX_STATE {
    Normal = "normal",
    Minimized = "minimized",
    Maximized = "maximized"
}
declare enum TELE_BOX_EVENT {
    DarkMode = "dark_mode",
    PrefersColorScheme = "prefers_color_scheme",
    Close = "close",
    Focus = "focus",
    Blur = "blur",
    Move = "move",
    Resize = "resize",
    IntrinsicMove = "intrinsic_move",
    IntrinsicResize = "intrinsic_resize",
    VisualResize = "visual_resize",
    ZIndex = "z_index",
    State = "state",
    Minimized = "minimized",
    Maximized = "maximized",
    Readonly = "readonly",
    Destroyed = "destroyed"
}
declare enum TELE_BOX_DELEGATE_EVENT {
    Close = "close",
    Maximize = "maximize",
    Minimize = "minimize"
}
declare enum TELE_BOX_RESIZE_HANDLE {
    North = "n",
    South = "s",
    West = "w",
    East = "e",
    NorthWest = "nw",
    NorthEast = "ne",
    SouthEast = "se",
    SouthWest = "sw"
}
declare const TeleBoxDragHandleType = "dh";

type TeleBoxColorScheme = `${TELE_BOX_COLOR_SCHEME}`;
type TeleBoxCoord = {
    x: number;
    y: number;
};
type TeleBoxSize = {
    width: number;
    height: number;
};
type TeleBoxState = `${TELE_BOX_STATE}`;
interface TeleBoxRect {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
}
interface TeleBoxConfig {
    /** Box ID. */
    readonly id?: string;
    /** Box title. Default empty. */
    readonly title?: string;
    /** Prefers Box color scheme. Default light. */
    readonly prefersColorScheme?: TeleBoxColorScheme;
    /** Actual Box Dark Mode */
    readonly darkMode?: boolean;
    /** Box visible. Default true. */
    readonly visible?: boolean;
    /** Box width relative to root element. 0~1. Default 0.5. */
    readonly width?: number;
    /** Box height relative to root element. 0~1. Default 0.5. */
    readonly height?: number;
    /** Minimum box width relative to root element. 0~1. Default 0. */
    readonly minWidth?: number;
    /** Minimum box height relative to root element. 0~1. Default 0. */
    readonly minHeight?: number;
    /** x position relative to root element. 0~1. Default 0.1. */
    readonly x?: number;
    /** y position relative to root element. 0~1. Default 0.1. */
    readonly y?: number;
    /** Maximize box. Default false. */
    readonly maximized?: boolean;
    /** Minimize box. Overwrites maximized state. Default false. */
    readonly minimized?: boolean;
    /** The initial state of the box. Default normal. */
    readonly state?: TeleBoxState;
    /** Is box readonly */
    readonly readonly?: boolean;
    /** Able to resize box window. Default true. */
    readonly resizable?: boolean;
    /** Able to drag box window Default true. */
    readonly draggable?: boolean;
    /** Restrict box to always be within the containing area. Default true. */
    readonly fence?: boolean;
    /** Fixed width/height ratio for box window. Default false. */
    readonly fixRatio?: boolean;
    /** Box focused. */
    readonly focus?: boolean;
    /** Base z-index for box. */
    readonly zIndex?: number;
    /** Classname Prefix. For CSS styling. Default "telebox". */
    readonly namespace?: string;
    /** TeleTitleBar Instance. */
    readonly titleBar?: TeleTitleBar;
    /** Box content. */
    readonly content?: HTMLElement;
    /** Box footer. */
    readonly footer?: HTMLElement;
    /** Box content styles. */
    readonly styles?: HTMLStyleElement;
    /** Position and dimension of container */
    readonly containerRect?: TeleBoxRect;
    /** Position and dimension of collector */
    readonly collectorRect?: TeleBoxRect;
    readonly fixed?: boolean;
    readonly addObserver?: (el: HTMLElement, cb: ResizeObserverCallback) => void;
}
type CheckTeleBoxConfig<T extends Record<`${TELE_BOX_EVENT}`, any>> = T;
type TeleBoxEventConfig = CheckTeleBoxConfig<{
    dark_mode: boolean;
    prefers_color_scheme: TeleBoxColorScheme;
    close: void;
    focus: void;
    blur: void;
    move: {
        x: number;
        y: number;
    };
    resize: {
        width: number;
        height: number;
    };
    intrinsic_move: {
        x: number;
        y: number;
    };
    intrinsic_resize: {
        width: number;
        height: number;
    };
    visual_resize: {
        width: number;
        height: number;
    };
    z_index: number;
    state: TeleBoxState;
    minimized: boolean;
    maximized: boolean;
    readonly: boolean;
    destroyed: void;
}>;
type TeleBoxEvent = keyof TeleBoxEventConfig;
interface TeleBoxEvents extends EventEmitter<TeleBoxEvent> {
    on<U extends TeleBoxEvent>(event: U, listener: (value: TeleBoxEventConfig[U]) => void): this;
    once<U extends TeleBoxEvent>(event: U, listener: (value: TeleBoxEventConfig[U]) => void): this;
    addListener<U extends TeleBoxEvent>(event: U, listener: (value: TeleBoxEventConfig[U]) => void): this;
    emit<U extends TeleBoxEvent>(event: U, ...value: TeleBoxEventConfig[U] extends void ? [] : [TeleBoxEventConfig[U]]): boolean;
}
type TeleBoxHandleType = TELE_BOX_RESIZE_HANDLE | typeof TeleBoxDragHandleType;
type CheckTeleBoxDelegateConfig<T extends Record<`${TELE_BOX_DELEGATE_EVENT}`, any>> = T;
type TeleBoxDelegateEventConfig = CheckTeleBoxDelegateConfig<{
    close: void;
    maximize: void;
    minimize: void;
}>;
type TeleBoxDelegateEvent = keyof TeleBoxDelegateEventConfig;
interface TeleBoxDelegateEvents extends EventEmitter<TeleBoxDelegateEvent> {
    on<U extends TeleBoxDelegateEvent>(event: U, listener: (value: TeleBoxDelegateEventConfig[U]) => void): this;
    once<U extends TeleBoxDelegateEvent>(event: U, listener: (value: TeleBoxDelegateEventConfig[U]) => void): this;
    addListener<U extends TeleBoxDelegateEvent>(event: U, listener: (value: TeleBoxDelegateEventConfig[U]) => void): this;
    emit<U extends TeleBoxDelegateEvent>(event: U, ...value: TeleBoxDelegateEventConfig[U] extends void ? [] : [TeleBoxDelegateEventConfig[U]]): boolean;
}

type TeleTitleBarEvent<U = keyof TeleBoxDelegateEventConfig> = U extends keyof TeleBoxDelegateEventConfig ? TeleBoxDelegateEventConfig[U] extends void ? {
    type: U;
    value?: TeleBoxDelegateEventConfig[U];
} : {
    type: U;
    value: TeleBoxDelegateEventConfig[U];
} : never;
interface TeleTitleBarConfig {
    readonly?: boolean;
    title?: string;
    state?: TeleBoxState;
    namespace?: string;
    onEvent?: (event: TeleTitleBarEvent) => void;
    onDragStart?: (event: MouseEvent | TouchEvent) => void;
}
interface TeleTitleBar {
    setTitle(title: string): void;
    setState(state: TeleBoxState): void;
    setReadonly(readonly: boolean): void;
    render(): HTMLElement;
    destroy(): void;
}

type DefaultTitleBarButton = TeleTitleBarEvent & {
    readonly iconClassName: string;
    readonly isActive?: (state: TeleBoxState) => boolean;
};
interface DefaultTitleBarConfig extends TeleTitleBarConfig {
    buttons?: ReadonlyArray<DefaultTitleBarButton>;
}
declare class DefaultTitleBar implements TeleTitleBar {
    constructor({ readonly, title, buttons, onEvent, onDragStart, namespace, state, }?: DefaultTitleBarConfig);
    readonly namespace: string;
    $titleBar: HTMLElement | undefined;
    $title: HTMLElement | undefined;
    $dragArea: HTMLElement;
    setTitle(title: string): void;
    setState(state: TeleBoxState): void;
    setReadonly(readonly: boolean): void;
    render(): HTMLElement;
    renderDragArea(): HTMLElement;
    dragHandle(): HTMLElement | undefined;
    wrapClassName(className: string): string;
    destroy(): void;
    onEvent?: TeleTitleBarConfig["onEvent"];
    onDragStart?: TeleTitleBarConfig["onDragStart"];
    protected readonly: boolean;
    protected title?: string;
    protected buttons: ReadonlyArray<DefaultTitleBarButton>;
    protected state: TeleBoxState;
    protected $btns: HTMLButtonElement[];
    protected sideEffect: SideEffectManager;
    protected lastTitleBarClick: {
        timestamp: number;
        clientX: number;
        clientY: number;
    };
    protected handleTitleBarClick: (ev: MouseEvent) => void;
    protected lastTitleBarTouch: {
        timestamp: number;
        clientX: number;
        clientY: number;
    };
    protected handleTitleBarTouch: (ev: TouchEvent) => void;
}

type AnyToVoidFunction = (...args: any[]) => void;

type ValConfig$1 = {
    prefersColorScheme: Val<TeleBoxColorScheme, boolean>;
    darkMode: Val<boolean, boolean>;
    containerRect: Val<TeleBoxRect, boolean>;
    collectorRect: Val<TeleBoxRect | undefined, boolean>;
    /** Box title. Default empty. */
    title: Val<string, boolean>;
    /** Is box visible */
    visible: Val<boolean, boolean>;
    /** Is box readonly */
    readonly: Val<boolean, boolean>;
    /** Able to resize box window */
    resizable: Val<boolean, boolean>;
    /** Able to drag box window */
    draggable: Val<boolean, boolean>;
    /** Restrict box to always be within the containing area. */
    fence: Val<boolean, boolean>;
    /** Fixed width/height ratio for box window. */
    fixRatio: Val<boolean, boolean>;
    focus: Val<boolean, boolean>;
    zIndex: Val<number, boolean>;
    /** Is box minimized. Default false. */
    minimized: Val<boolean, boolean>;
    /** Is box maximized. Default false. */
    maximized: Val<boolean, boolean>;
    $userContent: Val<HTMLElement | undefined>;
    $userFooter: Val<HTMLElement | undefined>;
    $userStyles: Val<HTMLStyleElement | undefined>;
};
interface TeleBox extends ValEnhancedResult<ValConfig$1> {
}
declare class TeleBox {
    constructor({ id, title, prefersColorScheme, darkMode, visible, width, height, minWidth, minHeight, x, y, minimized, maximized, readonly, resizable, draggable, fence, fixRatio, focus, zIndex, namespace, titleBar, content, footer, styles, containerRect, collectorRect, fixed, addObserver }?: TeleBoxConfig);
    readonly id: string;
    /** ClassName Prefix. For CSS styling. Default "telebox" */
    readonly namespace: string;
    readonly events: TeleBoxEvents;
    readonly _delegateEvents: TeleBoxDelegateEvents;
    protected _sideEffect: SideEffectManager;
    protected readonly addObserver: (el: HTMLElement, cb: ResizeObserverCallback) => void;
    protected _valSideEffectBinder: ValSideEffectBinder;
    titleBar: TeleTitleBar;
    _minSize$: Val<TeleBoxSize, boolean>;
    _size$: Val<TeleBoxSize, boolean>;
    _intrinsicSize$: Val<TeleBoxSize, boolean>;
    _visualSize$: Val<TeleBoxSize, boolean>;
    _coord$: Val<TeleBoxCoord, boolean>;
    _intrinsicCoord$: Val<TeleBoxCoord, boolean>;
    get darkMode(): boolean;
    _state$: Val<TeleBoxState, boolean>;
    get state(): TeleBoxState;
    /** @deprecated use setMaximized and setMinimized instead */
    setState(state: TeleBoxState, skipUpdate?: boolean): this;
    /** Minimum box width relative to container element. 0~1. Default 0. */
    get minWidth(): number;
    /** Minimum box height relative to container element. 0~1. Default 0. */
    get minHeight(): number;
    /**
     * @param minWidth Minimum box width relative to container element. 0~1.
     * @returns this
     */
    setMinWidth(minWidth: number, skipUpdate?: boolean): this;
    /**
     * @param minHeight Minimum box height relative to container element. 0~1.
     * @returns this
     */
    setMinHeight(minHeight: number, skipUpdate?: boolean): this;
    /** Intrinsic box width relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.5. */
    get intrinsicWidth(): number;
    /** Intrinsic box height relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.5. */
    get intrinsicHeight(): number;
    /**
     * Resize box.
     * @param width Box width relative to container element. 0~1.
     * @param height Box height relative to container element. 0~1.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    resize(width: number, height: number, skipUpdate?: boolean): this;
    /** Box width relative to container element. 0~1. Default 0.5. */
    get width(): number;
    /** Box height relative to container element. 0~1. Default 0.5. */
    get height(): number;
    /** Box width in pixels. */
    get absoluteWidth(): number;
    /** Box height in pixels. */
    get absoluteHeight(): number;
    /** Actual rendered box width relative to container element. 0~1. Default 0.5. */
    get visualWidth(): number;
    /** Actual rendered box height relative to container element. 0~1. Default 0.5. */
    get visualHeight(): number;
    /** Intrinsic box x position relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    get intrinsicX(): number;
    /** Intrinsic box y position relative to container element(without counting the effect of maximization or minimization). 0~1. Default 0.1. */
    get intrinsicY(): number;
    /**
     * Move box position.
     * @param x x position relative to container element. 0~1.
     * @param y y position relative to container element. 0~1.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    move(x: number, y: number, skipUpdate?: boolean): this;
    /** Box x position relative to container element. 0~1. Default 0.1. */
    get x(): number;
    /** Box y position relative to container element. 0~1. Default 0.1. */
    get y(): number;
    /**
     * Resize + Move, with respect to fixed ratio.
     * @param x x position relative to container element. 0~1.
     * @param y y position relative to container element. 0~1.
     * @param width Box width relative to container element. 0~1.
     * @param height Box height relative to container element. 0~1.
     * @param skipUpdate Skip emitting event.
     * @returns this
     */
    transform(x: number, y: number, width: number, height: number, skipUpdate?: boolean): this;
    /**
     * Mount box to a container element.
     */
    mount(container: HTMLElement): this;
    /**
     * Unmount box from the container element.
     */
    unmount(): this;
    /**
     * Mount dom to box content.
     */
    mountContent(content: HTMLElement): this;
    /**
     * Unmount content from the box.
     */
    unmountContent(): this;
    /**
     * Mount dom to box Footer.
     */
    mountFooter(footer: HTMLElement): this;
    /**
     * Unmount Footer from the box.
     */
    unmountFooter(): this;
    getUserStyles(): HTMLStyleElement | undefined;
    mountStyles(styles: string | HTMLStyleElement): this;
    unmountStyles(): this;
    setFixed(fixed: boolean): void;
    /** DOM of the box */
    $box: HTMLElement;
    $contentWrap: HTMLElement;
    private scale;
    /** DOM of the box content */
    $content: HTMLElement;
    /** DOM of the box title bar */
    $titleBar: HTMLElement;
    /** DOM of the box footer */
    $footer: HTMLElement;
    protected _renderSideEffect: SideEffectManager;
    render(root?: HTMLElement): HTMLElement;
    protected _handleTrackStart?: (ev: MouseEvent | TouchEvent) => void;
    handleTrackStart: (ev: MouseEvent | TouchEvent) => void;
    protected _renderResizeHandlers(): void;
    setScaleContent(scale: number): void;
    destroy(): void;
    /**
     * Wrap a className with namespace
     */
    wrapClassName(className: string): string;
    private fixed;
}
type PropKeys<K = keyof TeleBox> = K extends keyof TeleBox ? TeleBox[K] extends AnyToVoidFunction ? never : K : never;
type ReadonlyTeleBox = Pick<TeleBox, PropKeys | 'wrapClassName' | 'mountContent' | 'mountFooter' | 'mountStyles' | 'handleTrackStart' | 'setFixed'>;

type StringStyleKeys$1<T = keyof CSSStyleDeclaration> = T extends keyof CSSStyleDeclaration ? CSSStyleDeclaration[T] extends string ? T : never : never;
type TeleStyles$1 = Partial<Pick<CSSStyleDeclaration, StringStyleKeys$1>>;

interface TeleBoxCollectorConfig {
    visible?: boolean;
    readonly?: boolean;
    darkMode?: boolean;
    namespace?: string;
    styles?: TeleStyles$1;
    onClick?: () => void;
    minimizedBoxes?: string[];
    boxes?: TeleBox[];
    externalEvents?: any;
}
declare class TeleBoxCollector {
    constructor({ visible, readonly, darkMode, namespace, styles, onClick, minimizedBoxes, boxes, externalEvents }?: TeleBoxCollectorConfig);
    readonly styles: TeleStyles$1;
    readonly namespace: string;
    get visible(): boolean;
    get readonly(): boolean;
    get darkMode(): boolean;
    private externalEvents;
    onClick: ((boxId: string) => void) | undefined;
    $collector: HTMLElement | undefined;
    private wrp$;
    private count$;
    private $titles;
    protected root: HTMLElement | undefined;
    /**
     * Mount collector to a root element.
     */
    mount(root: HTMLElement): this;
    /**
     * Unmount collector from the root element.
     */
    unmount(): this;
    setVisible(visible: boolean): this;
    setReadonly(readonly: boolean): this;
    setDarkMode(darkMode: boolean): this;
    setStyles(styles: TeleStyles$1): this;
    setMinimizedBoxes(boxes: string[]): void;
    setBoxes(boxes: TeleBox[]): void;
    render(root: HTMLElement): HTMLElement;
    protected renderTitles(): HTMLElement;
    destroy(): void;
    wrapClassName(className: string): string;
    protected _visible: boolean;
    protected _readonly: boolean;
    protected _darkMode: boolean;
    protected minimizedBoxes: TeleBoxCollectorConfig['minimizedBoxes'];
    protected boxes: TeleBoxCollectorConfig['boxes'];
    protected handleCollectorClick: () => void;
    protected _sideEffect: SideEffectManager;
    protected popupVisible$: Val<boolean>;
}

declare enum TELE_BOX_MANAGER_EVENT {
    Focused = "focused",
    Blurred = "blurred",
    Created = "created",
    Removed = "removed",
    State = "state",
    Maximized = "maximized",
    Minimized = "minimized",
    Move = "move",
    Resize = "resize",
    IntrinsicMove = "intrinsic_move",
    IntrinsicResize = "intrinsic_resize",
    VisualResize = "visual_resize",
    ZIndex = "z_index",
    PrefersColorScheme = "prefers_color_scheme",
    DarkMode = "dark_mode"
}

type StringStyleKeys<T = keyof CSSStyleDeclaration> = T extends keyof CSSStyleDeclaration ? CSSStyleDeclaration[T] extends string ? T : never : never;
type TeleStyles = Partial<Pick<CSSStyleDeclaration, StringStyleKeys>>;
interface TeleBoxManagerConfig extends Pick<TeleBoxConfig, "prefersColorScheme" | "fence" | "containerRect" | "maximized" | "minimized" | "namespace" | "readonly"> {
    /** Element to mount boxes. */
    root?: HTMLElement;
    /** Where the minimized boxes go. */
    collector?: TeleBoxCollector;
    minimizedBoxes?: string[];
    maximizedBoxes?: string[];
}
type TeleBoxManagerBoxConfigBaseProps = "title" | "visible" | "width" | "height" | "minWidth" | "minHeight" | "x" | "y" | "resizable" | "draggable" | "fixRatio" | "zIndex" | 'maximized' | 'minimized';
type TeleBoxManagerCreateConfig = Pick<TeleBoxConfig, TeleBoxManagerBoxConfigBaseProps | "content" | "footer" | "id" | "focus">;
type TeleBoxManagerQueryConfig = Pick<TeleBoxConfig, TeleBoxManagerBoxConfigBaseProps | "id" | "focus">;
type TeleBoxManagerUpdateConfig = Pick<TeleBoxConfig, TeleBoxManagerBoxConfigBaseProps | "content" | "footer">;
type CheckTeleBoxManagerConfig<T extends Record<`${TELE_BOX_MANAGER_EVENT}`, any>> = T;
type TeleBoxManagerEventConfig = CheckTeleBoxManagerConfig<{
    focused: [ReadonlyTeleBox | undefined];
    blurred: [ReadonlyTeleBox | undefined];
    created: [ReadonlyTeleBox];
    removed: [ReadonlyTeleBox[]];
    state: [TeleBoxState];
    maximized: [string[]];
    minimized: [string[]];
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
}>;
type TeleBoxManagerEvent = keyof TeleBoxManagerEventConfig;
interface TeleBoxManagerEvents extends EventEmitter<TeleBoxManagerEvent> {
    on<U extends TeleBoxManagerEvent>(event: U, listener: (...value: TeleBoxManagerEventConfig[U]) => void): this;
    once<U extends TeleBoxManagerEvent>(event: U, listener: (...value: TeleBoxManagerEventConfig[U]) => void): this;
    addListener<U extends TeleBoxManagerEvent>(event: U, listener: (...value: TeleBoxManagerEventConfig[U]) => void): this;
    emit<U extends TeleBoxManagerEvent>(event: U, ...value: TeleBoxManagerEventConfig[U]): boolean;
}

type MaxTitleBarTeleBox = Pick<TeleBox, 'id' | 'title' | 'readonly'>;
interface MaxTitleBarConfig extends DefaultTitleBarConfig {
    darkMode: boolean;
    boxes: MaxTitleBarTeleBox[];
    containerRect: TeleBoxRect;
    focusedBox?: MaxTitleBarTeleBox;
    maximizedBoxes$: string[];
    minimizedBoxes$: string[];
}
declare class MaxTitleBar extends DefaultTitleBar {
    constructor(config: MaxTitleBarConfig);
    focusBox(box?: MaxTitleBarTeleBox): void;
    setContainerRect(rect: TeleBoxRect): void;
    setBoxes(boxes: MaxTitleBarTeleBox[]): void;
    setMaximizedBoxes(boxes: string[]): void;
    setMinimizedBoxes(boxes: string[]): void;
    setState(state: TeleBoxState): void;
    setReadonly(readonly: boolean): void;
    setDarkMode(darkMode: boolean): void;
    render(): HTMLElement;
    destroy(): void;
    updateTitles(): void;
    protected renderTitles(): HTMLElement;
    protected darkMode: boolean;
    protected $titles: HTMLElement | undefined;
    protected boxes: MaxTitleBarTeleBox[];
    focusedBox: MaxTitleBarTeleBox | undefined;
    protected containerRect: TeleBoxRect;
    protected maximizedBoxes$: MaxTitleBarConfig['maximizedBoxes$'];
    protected minimizedBoxes$: MaxTitleBarConfig['minimizedBoxes$'];
}

declare function createCallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction>(): {
    runCallbacks: (...args: any[]) => void;
    addCallback: (cb: T) => void;
    removeCallback: (cb: T) => void;
    hasCallbacks: () => boolean;
    removeAll: () => void;
};
type CallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction> = ReturnType<typeof createCallbackManager<T>>;

type ValConfig = {
    prefersColorScheme: Val<TeleBoxColorScheme, boolean>;
    containerRect: Val<TeleBoxRect, boolean>;
    collector: Val<TeleBoxCollector | null>;
    collectorRect: Val<TeleBoxRect | undefined>;
    readonly: Val<boolean, boolean>;
    fence: Val<boolean, boolean>;
    minimizedBoxes: Val<string[]>;
    maximizedBoxes: Val<string[]>;
};
interface TeleBoxManager extends ValEnhancedResult<ValConfig> {
}
declare class TeleBoxManager {
    externalEvents: TeleBoxManagerEvents;
    constructor({ root, prefersColorScheme, fence, containerRect, collector, namespace, readonly, minimizedBoxes, maximizedBoxes }?: TeleBoxManagerConfig);
    get boxes(): ReadonlyArray<TeleBox>;
    get topBox(): TeleBox | undefined;
    readonly events: TeleBoxManagerEvents;
    protected _sideEffect: SideEffectManager;
    protected sizeObserver: ResizeObserver;
    protected callbackManager: CallbackManager;
    protected elementObserverMap: Map<string, {
        el: HTMLElement;
        cb: AnyToVoidFunction;
    }[]>;
    protected root: HTMLElement;
    protected maximizedBoxes$: Val<string[]>;
    protected minimizedBoxes$: Val<string[]>;
    readonly namespace: string;
    _darkMode$: Val<boolean, boolean>;
    get darkMode(): boolean;
    _state$: Val<TeleBoxState, boolean>;
    get state(): TeleBoxState;
    setMinimized(data: boolean | string[], skipUpdate?: boolean): void;
    setMaximized(data: boolean | string[], skipUpdate?: boolean): void;
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
    destroy(skipUpdate?: boolean): void;
    wrapClassName(className: string): string;
    focusBox(boxOrID: string | TeleBox, skipUpdate?: boolean): void;
    focusTopBox(): void;
    blurBox(boxOrID: string | TeleBox, skipUpdate?: boolean): void;
    blurAll(skipUpdate?: boolean): void;
    setScaleContent(scale: number): void;
    protected maxTitleBar: MaxTitleBar;
    protected boxes$: Val<TeleBox[]>;
    protected topBox$: Val<TeleBox | undefined>;
    protected teleBoxMatcher(config: TeleBoxManagerQueryConfig): (box: TeleBox) => boolean;
    protected updateBox(box: TeleBox, config: TeleBoxManagerUpdateConfig, skipUpdate?: boolean): void;
    protected smartPosition(config?: TeleBoxConfig): TeleBoxConfig;
    protected makeBoxTop(box: TeleBox, skipUpdate?: boolean): void;
    makeBoxTopFromMaximized(boxId?: string): boolean;
    protected getBoxIndex(boxOrID: TeleBox | string): number;
    setMaxTitleFocus(boxOrID: TeleBox | string): void;
    protected getBox(boxOrID: TeleBox | string): TeleBox | undefined;
}

export { DefaultTitleBar, type DefaultTitleBarButton, type DefaultTitleBarConfig, type ReadonlyTeleBox, TELE_BOX_COLOR_SCHEME, TELE_BOX_DELEGATE_EVENT, TELE_BOX_EVENT, TELE_BOX_MANAGER_EVENT, TELE_BOX_RESIZE_HANDLE, TELE_BOX_STATE, TeleBox, TeleBoxCollector, type TeleBoxCollectorConfig, type TeleBoxColorScheme, type TeleBoxConfig, type TeleBoxCoord, type TeleBoxDelegateEvent, type TeleBoxDelegateEventConfig, type TeleBoxDelegateEvents, TeleBoxDragHandleType, type TeleBoxEvent, type TeleBoxEventConfig, type TeleBoxEvents, type TeleBoxHandleType, TeleBoxManager, type TeleBoxManagerConfig, type TeleBoxManagerCreateConfig, type TeleBoxManagerEvent, type TeleBoxManagerEventConfig, type TeleBoxManagerEvents, type TeleBoxManagerQueryConfig, type TeleBoxManagerUpdateConfig, type TeleBoxRect, type TeleBoxSize, type TeleBoxState, type TeleStyles, type TeleTitleBar, type TeleTitleBarConfig, type TeleTitleBarEvent };
