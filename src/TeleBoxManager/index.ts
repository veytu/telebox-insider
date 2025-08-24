import EventEmitter from 'eventemitter3'
import shallowequal from 'shallowequal'
import type { TeleBoxConfig, TeleBoxRect, TeleBoxState } from '../TeleBox/typings'
import { TeleBoxCollector } from '../TeleBoxCollector'
import { TeleBox } from '../TeleBox'
import type { ReadonlyTeleBox } from '../TeleBox'
import { TELE_BOX_EVENT, TELE_BOX_STATE } from '../TeleBox/constants'
import { TELE_BOX_MANAGER_EVENT } from './constants'
import type {
    TeleBoxManagerConfig,
    TeleBoxManagerCreateConfig,
    TeleBoxManagerEvents,
    TeleBoxManagerQueryConfig,
    TeleBoxManagerUpdateConfig
} from './typings'
import { MaxTitleBar } from './MaxTitleBar'
import type { TeleBoxColorScheme } from '..'
import { TELE_BOX_COLOR_SCHEME, TELE_BOX_DELEGATE_EVENT } from '..'
import { genUID, SideEffectManager } from 'side-effect-manager'
import type { ValEnhancedResult } from 'value-enhancer'
import { createSideEffectBinder, withValueEnhancer, Val } from 'value-enhancer'
import { excludeFromBoth, removeByVal, uniqueByVal } from '../utils'
import { createCallbackManager } from './utils/callbacks'
import type { CallbackManager } from './utils/callbacks'
import type { AnyToVoidFunction } from '../schedulers'

export * from './typings'
export * from './constants'

type ValConfig = {
    prefersColorScheme: Val<TeleBoxColorScheme, boolean>
    containerRect: Val<TeleBoxRect, boolean>
    collector: Val<TeleBoxCollector | null>
    collectorRect: Val<TeleBoxRect | undefined>
    readonly: Val<boolean, boolean>
    // minimized: Val<boolean, boolean>
    // maximized: Val<boolean, boolean>
    fence: Val<boolean, boolean>
    minimizedBoxes: Val<string[]>
    maximizedBoxes: Val<string[]>
}
export interface TeleBoxManager extends ValEnhancedResult<ValConfig> {}

export class TeleBoxManager {
    public externalEvents = new EventEmitter() as TeleBoxManagerEvents
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
        namespace = 'telebox',
        readonly = false,
        minimizedBoxes = [],
        maximizedBoxes = [],
        appReadonly = false
    }: TeleBoxManagerConfig = {}) {
        console.log('[TeleBox] Manager Constructor Start', { minimizedBoxes, maximizedBoxes, readonly, appReadonly })
        this._sideEffect = new SideEffectManager()
        const { combine, createVal } = createSideEffectBinder(this._sideEffect as any)
        this.callbackManager = createCallbackManager()
        this.sizeObserver = new ResizeObserver(this.callbackManager.runCallbacks)
        this.elementObserverMap = new Map()
        this.root = root
        this.namespace = namespace
        this.appReadonly = appReadonly
        this.boxes$ = createVal<TeleBox[]>([])
        this.topBox$ = this.boxes$.derive((boxes) => {
            if (boxes.length > 0) {
                const topBox = boxes.reduce((topBox, box) =>
                    topBox.zIndex > box.zIndex ? topBox : box
                )
                return topBox
            }
            return
        })

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
        const prefersDark$ = createVal(false)

        if (prefersDark) {
            prefersDark$.setValue(prefersDark.matches)
            this._sideEffect.add(() => {
                const handler = (evt: MediaQueryListEvent): void => {
                    prefersDark$.setValue(evt.matches)
                }
                prefersDark.addListener(handler)
                return () => prefersDark.removeListener(handler)
            })
        }

        const prefersColorScheme$ = createVal(prefersColorScheme)
        prefersColorScheme$.reaction((prefersColorScheme, _, skipUpdate) => {
            this.boxes.forEach((box) => box.setPrefersColorScheme(prefersColorScheme, skipUpdate))
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.PrefersColorScheme, prefersColorScheme)
            }
        })

        this._darkMode$ = combine(
            [prefersDark$, prefersColorScheme$],
            ([prefersDark, prefersColorScheme]) =>
                prefersColorScheme === 'auto' ? prefersDark : prefersColorScheme === 'dark'
        )
        this._darkMode$.reaction((darkMode, _, skipUpdate) => {
            this.boxes.forEach((box) => box.setDarkMode(darkMode, skipUpdate))
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.DarkMode, darkMode)
            }
        })

        const readonly$ = createVal(readonly)
        readonly$.reaction((readonly, _, skipUpdate) => {
            this.boxes.forEach((box) => box.setReadonly(readonly, skipUpdate))
        })

        this.maximizedBoxes$ = createVal(maximizedBoxes)
        this.minimizedBoxes$ = createVal(minimizedBoxes)
        console.log('[TeleBox] Manager Constructor Boxes Arrays Created', { maximizedBoxes, minimizedBoxes })
        this.maximizedBoxes$.reaction((maximizedBoxes, _, skipUpdate) => {
            console.log('[TeleBox] MaximizedBoxes Reaction Triggered', { maximizedBoxes, skipUpdate })
            this.boxes.forEach((box) => {
                const isMaximized = maximizedBoxes.includes(box.id)
                console.log('[TeleBox] Setting Box Maximized State', { boxId: box.id, isMaximized, skipUpdate })
                box.setMaximized(isMaximized, skipUpdate)
            })
            const maxBoxes = maximizedBoxes.filter((id) => !this.minimizedBoxes$.value.includes(id))
            console.log('[TeleBox] MaxTitleBar State Update', { maxBoxes, state: maxBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal })
            this.maxTitleBar.setState(
                maxBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal
            )
            this.maxTitleBar.setMaximizedBoxes(maximizedBoxes)
            if (!skipUpdate) {
                console.log('[TeleBox] Emitting Maximized Event', maximizedBoxes)
                this.events.emit(TELE_BOX_MANAGER_EVENT.Maximized, maximizedBoxes)
            }
        })

        const state$ = combine(
            [this.minimizedBoxes$, this.maximizedBoxes$],
            ([minimized, maximized]): TeleBoxState =>
                minimized.length
                    ? TELE_BOX_STATE.Minimized
                    : maximized.length
                    ? TELE_BOX_STATE.Maximized
                    : TELE_BOX_STATE.Normal
        )
        state$.reaction((state, _, skipUpdate) => {
            this.maxTitleBar.setState(state)
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.State, state)
            }
        })

        const fence$ = createVal(fence)
        fence$.subscribe((fence, _, skipUpdate) => {
            this.boxes.forEach((box) => box.setFence(fence, skipUpdate))
        })

        const containerRect$ = createVal(containerRect, shallowequal)
        containerRect$.reaction((containerRect, _, skipUpdate) => {
            this.boxes.forEach((box) => box.setContainerRect(containerRect, skipUpdate))
            this.maxTitleBar.setContainerRect(containerRect)
        })

        const collector$ = createVal(
            collector === null
                ? null
                : collector ||
                      new TeleBoxCollector({
                          visible: this.minimizedBoxes$.value.length > 0 && !this.readonly,
                          readonly: readonly$.value,
                          namespace,
                          minimizedBoxes: this.minimizedBoxes$.value,
                          boxes: this.boxes$.value,
                          externalEvents: this.externalEvents,
                          appReadonly: this.appReadonly
                      }).mount(root)
        )
        collector$.subscribe((collector) => {
            if (collector) {
                collector.setVisible(this.minimizedBoxes$.value.length > 0 && !readonly$.value)
                collector.setReadonly(readonly$.value)
                collector.setDarkMode(this._darkMode$.value)
                this._sideEffect.add(() => {
                    collector.onClick = (boxId) => {
                        console.log('[TeleBox] Collector Click Event', { boxId, readonly: readonly$.value })
                        if (!readonly$.value) {
                            const newMinimizedBoxes = removeByVal(
                                this.minimizedBoxes$.value.filter(Boolean),
                                boxId
                            ) as string[]
                            console.log('[TeleBox] Collector Click - Setting Minimized Boxes', { boxId, newMinimizedBoxes })
                            this.setMinimizedBoxes(newMinimizedBoxes)
                            this.externalEvents?.emit('OpenMiniBox', [])
                        }
                    }
                    return () => collector.destroy()
                }, 'collect-onClick')
            }
        })
        readonly$.subscribe((readonly) => {
            collector$.value?.setReadonly(readonly)
            collector$.value?.setVisible(this.minimizedBoxes$.value.length > 0 && !readonly$.value)
        })
        this._darkMode$.subscribe((darkMode) => {
            collector$.value?.setDarkMode(darkMode)
        })

        const calcCollectorRect = (): TeleBoxRect | undefined => {
            if (collector$.value?.$collector) {
                const { x, y, width, height } = collector$.value.$collector.getBoundingClientRect()
                const rootRect = this.root.getBoundingClientRect()
                return {
                    x: x - rootRect.x,
                    y: y - rootRect.y,
                    width,
                    height
                }
            }
            return
        }

        const collectorRect$ = createVal(
            this.minimizedBoxes$.value.length > 0 ? calcCollectorRect() : void 0
        )
        collectorRect$.subscribe((collectorRect, _, skipUpdate) => {
            this.boxes.forEach((box) => {
                box.setCollectorRect(collectorRect, skipUpdate)
            })
        })

        // minimized$.subscribe((minimized, _, skipUpdate) => {
        //     collector$.value?.setVisible(minimized)

        //     if (minimized) {
        //         if (collector$.value?.$collector) {
        //             collectorRect$.setValue(calcCollectorRect())
        //         } else if (import.meta.env.DEV) {
        //             console.warn('No collector for minimized boxes.')
        //         }
        //     }

        //     this.boxes.forEach((box) => box.setMinimized(minimized, skipUpdate))

        //     if (!skipUpdate) {
        //         this.events.emit(TELE_BOX_MANAGER_EVENT.Minimized, minimized)
        //     }
        // })

        this.minimizedBoxes$.reaction((minimizedBoxes, _, skipUpdate) => {
            console.log('[TeleBox] MinimizedBoxes Reaction Triggered', { minimizedBoxes, skipUpdate })
            this.boxes.forEach((box) => {
                const isMinimized = minimizedBoxes.includes(box.id)
                console.log('[TeleBox] Setting Box Minimized State', { boxId: box.id, isMinimized, skipUpdate })
                box.setMinimized(isMinimized, skipUpdate)
            }
            )

            const maxBoxes = this.maximizedBoxes$.value.filter((id) => !minimizedBoxes.includes(id))
            console.log('[TeleBox] MaxTitleBar State Update (Minimized)', { maxBoxes, state: maxBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal })
            this.maxTitleBar.setState(
                maxBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal
            )
            this.maxTitleBar.setMinimizedBoxes(minimizedBoxes)

            const minimized = minimizedBoxes.length > 0
            console.log('[TeleBox] Collector Visibility Update', { minimized, minimizedBoxes })
            collector$.value?.setVisible(minimized)
            this.collector?.setMinimizedBoxes(minimizedBoxes)
            if (minimized) {
                if (collector$.value?.$collector) {
                    collectorRect$.setValue(calcCollectorRect())
                } else if (import.meta.env.DEV) {
                    console.warn('No collector for minimized boxes.')
                }
            }
            if (!skipUpdate) {
                console.log('[TeleBox] Emitting Minimized Event', minimizedBoxes)
                this.events.emit(TELE_BOX_MANAGER_EVENT.Minimized, minimizedBoxes)
            }
        })

        const closeBtnClassName = this.wrapClassName('titlebar-icon-close')

        const checkFocusBox = (ev: MouseEvent | TouchEvent): void => {
            if (readonly$.value) {
                return
            }

            const target = ev.target as HTMLElement
            if (!target.tagName) {
                return
            }

            for (let el: HTMLElement | null = target; el; el = el.parentElement) {
                if (el.classList && el.classList.contains(closeBtnClassName)) {
                    return
                }
                const id = el.dataset?.teleBoxID
                if (id) {
                    const box = this.getBox(id)
                    if (box) {
                        this.focusBox(box)
                        this.makeBoxTop(box)
                        return
                    }
                }
            }
        }

        this._sideEffect.addEventListener(window, 'mousedown', checkFocusBox, true)
        this._sideEffect.addEventListener(window, 'touchstart', checkFocusBox, true)

        this.maxTitleBar = new MaxTitleBar({
            darkMode: this.darkMode,
            readonly: readonly$.value,
            namespace: this.namespace,
            state: state$.value,
            boxes: this.boxes$.value,
            containerRect: containerRect$.value,
            maximizedBoxes$: this.maximizedBoxes$.value,
            minimizedBoxes$: this.minimizedBoxes$.value,
            onEvent: (event): void => {
                console.log('[TeleBox] MaxTitleBar Event Received', { eventType: event.type, focusedBox: this.maxTitleBar.focusedBox?.id })
                switch (event.type) {
                    case TELE_BOX_DELEGATE_EVENT.Maximize: {
                        console.log('[TeleBox] MaxTitleBar Maximize Event', { focusedBox: this.maxTitleBar.focusedBox?.id })
                        if (this.maxTitleBar.focusedBox?.id) {
                            const oldFocusId = this.maxTitleBar.focusedBox?.id
                            const isInMaximizedBoxes =
                                this.maximizedBoxes$.value.includes(oldFocusId)
                            const newMaximizedBoxes: string[] = isInMaximizedBoxes
                                ? removeByVal([...this.maximizedBoxes$.value], oldFocusId)
                                : uniqueByVal([
                                      ...this.maximizedBoxes$.value,
                                      this.maxTitleBar.focusedBox?.id
                                  ])

                            console.log('[TeleBox] MaxTitleBar Maximize - Setting Maximized Boxes', { 
                                oldFocusId, 
                                isInMaximizedBoxes, 
                                currentMaximized: this.maximizedBoxes$.value,
                                newMaximizedBoxes 
                            })
                            this.setMaximizedBoxes(newMaximizedBoxes)

                            const hasTopBox = this.makeBoxTopFromMaximized()
                            console.log('[TeleBox] MaxTitleBar Maximize - Box Top Management', { hasTopBox, oldFocusId })

                            const oldFocusBox = this.boxes$.value.find(
                                (box) => box.id == oldFocusId
                            )
                            if (oldFocusBox) {
                                console.log('[TeleBox] MaxTitleBar Maximize - Making Old Focus Box Top', { oldFocusId })
                                this.makeBoxTop(oldFocusBox)
                            }
                            if (!hasTopBox) {
                                console.log('[TeleBox] MaxTitleBar Maximize - No Top Box, Clearing Maximized', { hasTopBox })
                                this.setMaximizedBoxes([])
                            }
                        } else {
                            console.log('[TeleBox] MaxTitleBar Maximize - No Focused Box, Clearing Maximized')
                            this.setMaximizedBoxes([])
                        }
                        console.log('[TeleBox] MaxTitleBar Maximize - Emitting External Event')
                        this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Maximized, [])
                        break
                    }
                    case TELE_BOX_DELEGATE_EVENT.Minimize: {
                        console.log('[TeleBox] MaxTitleBar Minimize Event', { focusedBox: this.maxTitleBar.focusedBox?.id })
                        if (this.maxTitleBar.focusedBox?.id) {
                            const newMinimizedBoxes: string[] = uniqueByVal([
                                ...this.minimizedBoxes$.value,
                                this.maxTitleBar.focusedBox?.id
                            ])

                            console.log('[TeleBox] MaxTitleBar Minimize - Setting Minimized Boxes', { 
                                focusedBox: this.maxTitleBar.focusedBox?.id,
                                currentMinimized: this.minimizedBoxes$.value,
                                newMinimizedBoxes 
                            })

                            this.makeBoxTopFromMaximized()

                            this.setMinimizedBoxes(newMinimizedBoxes)
                        }
                        console.log('[TeleBox] MaxTitleBar Minimize - Emitting External Event', this.minimizedBoxes$.value)
                        this.externalEvents.emit(
                            TELE_BOX_MANAGER_EVENT.Minimized,
                            this.minimizedBoxes$.value
                        )
                        break
                    }
                    case TELE_BOX_EVENT.Close: {
                        console.log('[TeleBox] MaxTitleBar Close Event', { focusedBox: this.maxTitleBar.focusedBox?.id })
                        const focusedId = this.maxTitleBar.focusedBox?.id
                        if (focusedId) {
                            console.log('[TeleBox] MaxTitleBar Close - Removing Box', { focusedId })
                            this.remove(focusedId)
                            this.makeBoxTopFromMaximized()
                            const newMaximizedBoxes = removeByVal(this.maximizedBoxes$.value, focusedId)
                            console.log('[TeleBox] MaxTitleBar Close - Updating Maximized Boxes', { 
                                focusedId, 
                                currentMaximized: this.maximizedBoxes$.value,
                                newMaximizedBoxes 
                            })
                            this.setMaximizedBoxes(newMaximizedBoxes)
                        }
                        console.log('[TeleBox] MaxTitleBar Close - Emitting External Event')
                        this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Removed, [])
                        this.focusTopBox()
                        break
                    }
                    default: {
                        break
                    }
                }
            },
            appReadonly: this.appReadonly
        })
        readonly$.subscribe((readonly) => this.maxTitleBar.setReadonly(readonly))
        this._darkMode$.subscribe((darkMode) => {
            this.maxTitleBar.setDarkMode(darkMode)
        })
        this.boxes$.reaction((boxes) => {
            this.maxTitleBar.setBoxes(boxes)
            this.collector?.setBoxes(boxes)
        })

        this.maximizedBoxes$.reaction((boxes) => {
            this.maxTitleBar.setMaximizedBoxes(boxes)
            const list = this.boxes$.value.filter((item) => boxes.includes(item.id)).sort((a, b) => b.zIndex - a.zIndex)
            if(list && list.length > 0) {
                this.maxTitleBar.setIndexZ(list[0].zIndex + 1)
            }
        })

        this.minimizedBoxes$.reaction((boxes) => {
            this.maxTitleBar.setMinimizedBoxes(boxes)
            const list = this.boxes$.value.filter((item) => boxes.includes(item.id)).sort((a, b) => b.zIndex - a.zIndex)
            if(list && list.length > 0) {
                this.maxTitleBar.setIndexZ(list[0].zIndex + 1)
            }        })

        const valConfig: ValConfig = {
            prefersColorScheme: prefersColorScheme$,
            containerRect: containerRect$,
            collector: collector$,
            collectorRect: collectorRect$,
            readonly: readonly$,
            fence: fence$,
            maximizedBoxes: this.maximizedBoxes$,
            minimizedBoxes: this.minimizedBoxes$
        }

        withValueEnhancer(this, valConfig)

        this._state$ = state$

        this.root.appendChild(this.maxTitleBar.render())
    }

    public get boxes(): ReadonlyArray<TeleBox> {
        return this.boxes$.value
    }

    public get topBox(): TeleBox | undefined {
        return this.topBox$.value
    }

    public readonly events = new EventEmitter() as TeleBoxManagerEvents

    protected _sideEffect: SideEffectManager
    protected sizeObserver: ResizeObserver
    protected callbackManager: CallbackManager
    protected elementObserverMap: Map<string, { el: HTMLElement; cb: AnyToVoidFunction }[]>

    protected root: HTMLElement

    protected maximizedBoxes$: Val<string[]>
    protected minimizedBoxes$: Val<string[]>

    public readonly namespace: string

    public _darkMode$: Val<boolean, boolean>

    public get darkMode(): boolean {
        return this._darkMode$.value
    }

    public _state$: Val<TeleBoxState, boolean>

    public get state(): TeleBoxState {
        return this._state$.value
    }

    public setMinimized(data: boolean | string[], skipUpdate = false): void {
        console.log('[TeleBox] SetMinimized Called', { data, skipUpdate })
    }
    public setMaximized(data: boolean | string[], skipUpdate = false): void {
        console.log('[TeleBox] SetMaximized Called', { data, skipUpdate })
    }

    /** @deprecated use setMaximized and setMinimized instead */
    public setState(state: TeleBoxState, skipUpdate = false): this {
        console.log(skipUpdate)
        switch (state) {
            case TELE_BOX_STATE.Maximized: {
                // this.setMinimized(false, skipUpdate)
                // this.setMaximized(true, skipUpdate)
                break
            }
            case TELE_BOX_STATE.Minimized: {
                // this.setMinimized(true, skipUpdate)
                // this.setMaximized(false, skipUpdate)
                break
            }
            default: {
                // this.setMinimized(false, skipUpdate)
                // this.setMaximized(false, skipUpdate)
                break
            }
        }
        return this
    }

    public create(config: TeleBoxManagerCreateConfig = {}, smartPosition = true): ReadonlyTeleBox {
        const id = config.id || genUID()

        const managerMaximized$ = this.maximizedBoxes$.value.includes(id)

        const managerMinimized$ = this.maximizedBoxes$.value.includes(id)

        const box = new TeleBox({
            zIndex: this.topBox ? this.topBox.zIndex + 1 : 100,
            ...(smartPosition ? this.smartPosition(config) : config),
            darkMode: this.darkMode,
            prefersColorScheme: this.prefersColorScheme,
            maximized: managerMaximized$,
            minimized: managerMinimized$,
            fence: this.fence,
            namespace: this.namespace,
            containerRect: this.containerRect,
            readonly: this.readonly,
            collectorRect: this.collectorRect,
            id,
            appReadonly: this.appReadonly,
            addObserver: (el: HTMLElement, cb: ResizeObserverCallback) => {
                const observer = this.elementObserverMap.get(id)

                if (!observer) {
                    this.elementObserverMap.set(id, [{ el, cb }])
                } else {
                    observer.push({ el, cb })
                }

                this.callbackManager.addCallback(cb)
                this.sizeObserver.observe(el)
            }
        })

        box.mount(this.root)

        if (box.focus) {
            this.focusBox(box)
            if (smartPosition) {
                this.makeBoxTop(box)
            }
        }

        this.boxes$.setValue([...this.boxes, box])

        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Maximize, () => {
            console.log('[TeleBox] Box Maximize Event', { boxId: box.id })
            const allBoxIds = this.boxes$.value.map((item) => item.id)
            console.log('[TeleBox] Box Maximize - Setting All Boxes Maximized', { boxId: box.id, allBoxIds })
            this.setMaximizedBoxes(allBoxIds)
            this.maxTitleBar.focusBox(box)
            console.log('[TeleBox] Box Maximize - Emitting External Event', [box.id])
            this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Maximized, [box.id])
        })
        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Minimize, () => {
            console.log('[TeleBox] Box Minimize Event', { boxId: box.id })
            const newMinimizedBoxes = [...this.minimizedBoxes$.value, id]
            console.log('[TeleBox] Box Minimize - Setting Minimized Boxes', { boxId: box.id, newMinimizedBoxes })
            this.setMinimizedBoxes(newMinimizedBoxes)
            console.log('[TeleBox] Box Minimize - Emitting External Event', [box.id])
            this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Minimized, [box.id])
        })
        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Close, () => {
            console.log('[TeleBox] Box Close Event', { boxId: box.id })
            this.remove(box)
            this.makeBoxTopFromMaximized(box.id)
            this.focusTopBox()
            console.log('[TeleBox] Box Close - Emitting External Event', [box])
            this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.Removed, [box])
        })
        box._coord$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.Move, box)
            }
        })
        box._size$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.Resize, box)
            }
        })
        box._intrinsicCoord$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicMove, box)
            }
        })
        box._intrinsicSize$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.IntrinsicResize, box)
            }
        })
        box._visualSize$.reaction((_, __, skipUpdate) => {
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.VisualResize, box)
            }
        })
        box._zIndex$.reaction((_, __, skipUpdate) => {
            if (this.boxes.length > 0) {
                const topBox = this.boxes.reduce((topBox, box) =>
                    topBox.zIndex > box.zIndex ? topBox : box
                )
                this.topBox$.setValue(topBox)
            }
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.ZIndex, box)
            }
            const list = this.boxes$.value.filter((item) => this.maximizedBoxes$.value.includes(item.id)).sort((a, b) => b.zIndex - a.zIndex)
            if(list && list.length > 0) {
                this.maxTitleBar.setIndexZ(list[0].zIndex + 1)
            }
        })
        this.events.emit(TELE_BOX_MANAGER_EVENT.Created, box)

        return box
    }

    public query(config?: TeleBoxManagerQueryConfig): ReadonlyTeleBox[] {
        return config ? this.boxes.filter(this.teleBoxMatcher(config)) : [...this.boxes]
    }

    public queryOne(config?: TeleBoxManagerQueryConfig): ReadonlyTeleBox | undefined {
        return config ? this.boxes.find(this.teleBoxMatcher(config)) : this.boxes[0]
    }

    public update(boxID: string, config: TeleBoxManagerUpdateConfig, skipUpdate = false): void {
        const box = this.boxes.find((box) => box.id === boxID)
        if (box) {
            return this.updateBox(box, config, skipUpdate)
        }
    }

    public updateAll(config: TeleBoxManagerUpdateConfig, skipUpdate = false): void {
        this.boxes.forEach((box) => {
            this.updateBox(box, config, skipUpdate)
        })
    }

    public remove(boxOrID: string | TeleBox, skipUpdate = false): ReadonlyTeleBox | undefined {
        console.log('[TeleBox] Remove Method Called', { boxOrID, skipUpdate })
        const index = this.getBoxIndex(boxOrID)
        if (index >= 0) {
            const boxes = this.boxes.slice()
            const deletedBoxes = boxes.splice(index, 1)
            this.boxes$.setValue(boxes)
            deletedBoxes.forEach((box) => box.destroy())
            const boxId = this.getBox(boxOrID)?.id
            if (boxId) {
                console.log('[TeleBox] Remove - Updating Box Arrays', { boxId, currentMaximized: this.maximizedBoxes$.value, currentMinimized: this.minimizedBoxes$.value })
                this.setMaximizedBoxes(removeByVal(this.maximizedBoxes$.value, boxId))
                this.setMinimizedBoxes(removeByVal(this.minimizedBoxes$.value, boxId))
                const observeData = this.elementObserverMap.get(boxId)
                if (observeData) {
                    observeData.forEach(({ el, cb }) => {
                        this.callbackManager.removeCallback(cb)
                        this.sizeObserver.unobserve(el)
                        this.elementObserverMap.delete(boxId)
                    })
                }
            }
            if (!skipUpdate) {
                if (this.boxes.length <= 0) {
                    console.log('[TeleBox] Remove - No Boxes Left, Clearing Arrays')
                    this.setMaximizedBoxes([])
                    this.setMinimizedBoxes([])
                }
                console.log('[TeleBox] Remove - Emitting Removed Event', deletedBoxes)
                this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes)
            }
            return deletedBoxes[0]
        }
        return
    }

    public removeTopBox(): ReadonlyTeleBox | undefined {
        if (this.topBox) {
            return this.remove(this.topBox)
        }
        return
    }

    public removeAll(skipUpdate = false): ReadonlyTeleBox[] {
        console.log('[TeleBox] RemoveAll Method Called', { skipUpdate, boxCount: this.boxes$.value.length })
        const deletedBoxes = this.boxes$.value
        this.boxes$.setValue([])
        deletedBoxes.forEach((box) => box.destroy())
        this.sizeObserver.disconnect()
        this.elementObserverMap = new Map()
        this.callbackManager.removeAll()
        if (!skipUpdate) {
            if (this.boxes.length <= 0) {
                console.log('[TeleBox] RemoveAll - No Boxes Left, Clearing Arrays')
                this.setMaximizedBoxes([])
                this.setMinimizedBoxes([])
            }
            console.log('[TeleBox] RemoveAll - Emitting Removed Event', deletedBoxes)
            this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, deletedBoxes)
        }
        return deletedBoxes
    }

    public destroy(skipUpdate = false): void {
        this.events.removeAllListeners()
        this._sideEffect.flushAll()
        this.removeAll(skipUpdate)
        this.sizeObserver.disconnect()
        this.callbackManager.removeAll()
        Object.keys(this).forEach((key) => {
            const value = this[key as keyof this]
            if (value instanceof Val) {
                value.destroy()
            }
        })
    }

    public wrapClassName(className: string): string {
        return `${this.namespace}-${className}`
    }

    public focusBox(boxOrID: string | TeleBox, skipUpdate = false): void {
        console.log('[TeleBox] FocusBox Called', { boxOrID, skipUpdate })
        const targetBox = this.getBox(boxOrID)
        if (targetBox) {
            console.log('[TeleBox] FocusBox - Target Box Found', { targetBoxId: targetBox.id, currentFocus: targetBox.focus })
            this.boxes.forEach((box) => {
                if (targetBox === box) {
                    let focusChanged = false
                    if (!targetBox.focus) {
                        focusChanged = true
                        targetBox.setFocus(true, skipUpdate)
                    }
                    if (focusChanged && !skipUpdate) {
                        this.events.emit(TELE_BOX_MANAGER_EVENT.Focused, targetBox)
                    }
                } else if (box.focus) {
                    // if (!this.maximizedBoxes$.value.includes(box.id)) {

                    // }
                    this.blurBox(box, skipUpdate)
                }
            })
            if (this.maximizedBoxes$.value.length > 0) {
                if (this.maximizedBoxes$.value.includes(targetBox.id)) {
                    console.log('[TeleBox] FocusBox - MaxTitleBar Focus (Maximized Box)', { targetBoxId: targetBox.id })
                    this.maxTitleBar.focusBox(targetBox)
                }
            } else {
                console.log('[TeleBox] FocusBox - MaxTitleBar Focus (No Maximized Boxes)', { targetBoxId: targetBox.id })
                this.maxTitleBar.focusBox(targetBox)
            }
        }
    }

    public focusTopBox(): void {
        console.log('[TeleBox] FocusTopBox Called', { topBox: this.topBox?.id, topBoxFocus: this.topBox?.focus })
        if (this.topBox && !this.topBox.focus) {
            console.log('[TeleBox] FocusTopBox - Focusing Top Box', { topBox: this.topBox.id })
            return this.focusBox(this.topBox)
        }
    }

    public blurBox(boxOrID: string | TeleBox, skipUpdate = false): void {
        const targetBox = this.getBox(boxOrID)
        if (targetBox) {
            if (targetBox.focus) {
                targetBox.setFocus(false, skipUpdate)
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, targetBox)
                }
            }
            // test
            // if (this.maxTitleBar.focusedBox === targetBox) {
            //     this.maxTitleBar.focusBox()
            // }
        }
    }

    public blurAll(skipUpdate = false): void {
        this.boxes.forEach((box) => {
            if (box.focus) {
                box.setFocus(false, skipUpdate)
                if (!skipUpdate) {
                    this.events.emit(TELE_BOX_MANAGER_EVENT.Blurred, box)
                }
            }
        })
        if (this.maxTitleBar.focusedBox) {
            this.maxTitleBar.focusBox()
        }
    }

    public setScaleContent(appId: string, scale: number): void {
        const box = this.boxes.find((item) => item.id == appId)

        if (box) {
            box.setScaleContent(scale)
        }
    }

    protected maxTitleBar: MaxTitleBar

    protected boxes$: Val<TeleBox[]>
    protected topBox$: Val<TeleBox | undefined>

    protected teleBoxMatcher(config: TeleBoxManagerQueryConfig): (box: TeleBox) => boolean {
        const keys = Object.keys(config) as Array<keyof TeleBoxManagerQueryConfig>
        return (box: TeleBox): boolean => keys.every((key) => config[key] === box[key])
    }

    protected updateBox(
        box: TeleBox,
        config: TeleBoxManagerUpdateConfig,
        skipUpdate = false
    ): void {
        console.log('[TeleBox] UpdateBox Method Called', { boxId: box.id, config, skipUpdate })
        if (config.x != null || config.y != null) {
            box.move(
                config.x == null ? box.intrinsicX : config.x,
                config.y == null ? box.intrinsicY : config.y,
                skipUpdate
            )
        }
        if (config.width != null || config.height != null) {
            box.resize(
                config.width == null ? box.intrinsicWidth : config.width,
                config.height == null ? box.intrinsicHeight : config.height,
                skipUpdate
            )
        }
        if (config.title != null) {
            box.setTitle(config.title)
            this.maxTitleBar.updateTitles()
        }
        if (config.visible != null) {
            box.setVisible(config.visible, skipUpdate)
        }
        if (config.minHeight != null) {
            box.setMinHeight(config.minHeight, skipUpdate)
        }
        if (config.minWidth != null) {
            box.setMinWidth(config.minWidth, skipUpdate)
        }
        if (config.resizable != null) {
            box.setResizable(config.resizable, skipUpdate)
        }
        if (config.draggable != null) {
            box.setDraggable(config.draggable, skipUpdate)
        }
        if (config.fixRatio != null) {
            box.setFixRatio(config.fixRatio, skipUpdate)
        }
        if (config.zIndex != null) {
            box.setZIndex(config.zIndex, skipUpdate)
        }
        if (config.content != null) {
            box.mountContent(config.content)
        }
        if (config.footer != null) {
            box.mountFooter(config.footer)
        }
        if (box.id?.includes('audio')) {
            console.log('[TeleBox] UpdateBox - Audio Box Special Handling', { boxId: box.id })
            box.setMaximized(true, skipUpdate)
            box.setMinimized(false, skipUpdate)
        } else {
            console.log('[TeleBox] UpdateBox - Regular Box Config', config)
            if (config.maximized != null) {
                console.log('[TeleBox] UpdateBox - Setting Maximized', { boxId: box.id, maximized: config.maximized, skipUpdate })
                box.setMaximized(config.maximized, skipUpdate)
            }
            if (config.minimized != null) {
                console.log('[TeleBox] UpdateBox - Setting Minimized', { boxId: box.id, minimized: config.minimized, skipUpdate })
                box.setMinimized(config.minimized, skipUpdate)
            }
            // box.setMaximized(!!config.maximized, skipUpdate)
            // box.setMinimized(!!config.minimized, skipUpdate)
        }
    }

    protected smartPosition(config: TeleBoxConfig = {}): TeleBoxConfig {
        let { x, y } = config
        const { width = 0.5, height = 0.5 } = config

        if (x == null) {
            let vx = 20
            if (this.topBox) {
                vx = this.topBox.intrinsicX * this.containerRect.width + 20

                if (vx > this.containerRect.width - width * this.containerRect.width) {
                    vx = 20
                }
            }
            x = vx / this.containerRect.width
        }

        if (y == null) {
            let vy = 20

            if (this.topBox) {
                vy = this.topBox.intrinsicY * this.containerRect.height + 20

                if (vy > this.containerRect.height - height * this.containerRect.height) {
                    vy = 20
                }
            }

            y = vy / this.containerRect.height
        }

        return { ...config, x, y, width, height }
    }

    protected makeBoxTop(box: TeleBox, skipUpdate = false): void {
        if (this.topBox) {
            if (box !== this.topBox) {
                if (this.maximizedBoxes$.value.includes(box.id)) {
                    const newIndex = this.topBox.zIndex + 1

                    const normalBoxesIds = excludeFromBoth(
                        this.boxes$.value.map((item) => item.id),
                        this.maximizedBoxes$.value,
                        this.minimizedBoxes$.value
                    )
                    const normalBoxes = this.boxes$.value.filter((box) =>
                        normalBoxesIds.includes(box.id)
                    )

                    box._zIndex$.setValue(newIndex, skipUpdate)

                    normalBoxes
                        .sort((a, b) => a._zIndex$.value - b._zIndex$.value)
                        .forEach((box, index) => {
                            box._zIndex$.setValue(newIndex + 1 + index, skipUpdate)
                        })
                } else {
                    box._zIndex$.setValue(this.topBox.zIndex + 1, skipUpdate)
                }
            }
        }
    }

    public makeBoxTopFromMaximized(boxId?: string): boolean {
        console.log('[TeleBox] MakeBoxTopFromMaximized Called', { boxId, currentMaximized: this.maximizedBoxes$.value, currentMinimized: this.minimizedBoxes$.value })
        let maxIndexBox = undefined
        if (boxId) {
            if (
                this.maximizedBoxes$.value.includes(boxId) &&
                !this.minimizedBoxes$.value.includes(boxId)
            ) {
                maxIndexBox = this.boxes$.value.find((box) => box.id === boxId)
                console.log('[TeleBox] MakeBoxTopFromMaximized - Found Specific Box', { boxId, maxIndexBox: maxIndexBox?.id })
            }
        } else {
            const nextFocusBoxes = this.boxes$.value.filter((box) => {
                return (
                    box.id != this.maxTitleBar.focusedBox?.id &&
                    this.maximizedBoxes$.value.includes(box.id) &&
                    !this.minimizedBoxes$.value.includes(box.id)
                )
            })

            console.log('[TeleBox] MakeBoxTopFromMaximized - Next Focus Boxes', { nextFocusBoxes: nextFocusBoxes.map(b => b.id) })

            maxIndexBox = nextFocusBoxes.length
                ? nextFocusBoxes.reduce((maxItem, current) => {
                      return current._zIndex$.value > maxItem._zIndex$.value ? current : maxItem
                  })
                : undefined

            if (maxIndexBox) {
                console.log('[TeleBox] MakeBoxTopFromMaximized - Focusing Max Index Box', { maxIndexBox: maxIndexBox.id })
                this.maxTitleBar.focusBox(maxIndexBox)
            }
        }

        const result = !!maxIndexBox
        console.log('[TeleBox] MakeBoxTopFromMaximized Result', { result, maxIndexBox: maxIndexBox?.id })
        return result
    }
    private appReadonly = false
    protected getBoxIndex(boxOrID: TeleBox | string): number {
        return typeof boxOrID === 'string'
            ? this.boxes.findIndex((box) => box.id === boxOrID)
            : this.boxes.findIndex((box) => box === boxOrID)
    }

    public setMaxTitleFocus(boxOrID: TeleBox | string): void {
        !!this.getBox(boxOrID) && this.maxTitleBar.focusBox(this.getBox(boxOrID))
    }

    protected getBox(boxOrID: TeleBox | string): TeleBox | undefined {
        return typeof boxOrID === 'string' ? this.boxes.find((box) => box.id === boxOrID) : boxOrID
    }
}
