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
    allBoxStatusInfo: Val<Record<string, TELE_BOX_STATE>, boolean>
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
        allBoxStatusInfo = {},
        appReadonly = false
    }: TeleBoxManagerConfig = {}) {
        console.log('[TeleBox] Manager Constructor Start', { allBoxStatusInfo, readonly, appReadonly })
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
            this.boxes$.value.forEach((box) => box.setPrefersColorScheme(prefersColorScheme, skipUpdate))
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
            this.boxes$.value.forEach((box) => box.setDarkMode(darkMode, skipUpdate))
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.DarkMode, darkMode)
            }
        })

        const readonly$ = createVal(readonly)
        readonly$.reaction((readonly, _, skipUpdate) => {
            this.boxes$.value.forEach((box) => box.setReadonly(readonly, skipUpdate))
        })

        // 从allBoxStatusInfo中提取minimizedBoxes和maximizedBoxes
        const extractedMinimizedBoxes = Object.entries(allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Minimized)
            .map(([boxId, _]) => boxId)
        const extractedMaximizedBoxes = Object.entries(allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Maximized)
            .map(([boxId, _]) => boxId)
        
        this.allBoxStatusInfo$ = createVal(allBoxStatusInfo)
        console.log('[TeleBox] Manager Constructor AllBoxStatusInfo Created', { allBoxStatusInfo })
        this.allBoxStatusInfo$.reaction((allBoxStatusInfo, _, skipUpdate) => {
            console.log('[TeleBox] AllBoxStatusInfo Reaction Triggered', { allBoxStatusInfo, skipUpdate })
            const maximizedBoxes = this.getMaximizedBoxes(allBoxStatusInfo)
            const minimizedBoxes = this.getMinimizedBoxes(allBoxStatusInfo)
            
            // 设置box状态，但使用skipUpdate=true避免触发事件循环
            this.boxes$.value.forEach((box) => {
                const isMaximized = maximizedBoxes.includes(box.id)
                const isMinimized = minimizedBoxes.includes(box.id)
                console.log('[TeleBox] Setting Box States', { boxId: box.id, isMaximized, isMinimized, skipUpdate })
                box.setMaximized(isMaximized, true) // 使用true来跳过事件触发
                box.setMinimized(isMinimized, true) // 使用true来跳过事件触发
            })
            
            console.log('[TeleBox] MaxTitleBar State Update', { maximizedBoxes, state: maximizedBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal })
            this.maxTitleBar.setState(
                maximizedBoxes.length > 0 ? TELE_BOX_STATE.Maximized : TELE_BOX_STATE.Normal
            )
            this.maxTitleBar.setAllBoxStatusInfo({ ...allBoxStatusInfo })


            const minimized = minimizedBoxes.length > 0
            console.log('[TeleBox] Collector Visibility Update', { minimized, minimizedBoxes })
            collector$.value?.setVisible(minimized)
            this.collector?.setAllBoxStatusInfo({ ...allBoxStatusInfo })
            if (minimized) {
                if (collector$.value?.$collector) {
                    collectorRect$.setValue(calcCollectorRect())
                } else if (import.meta.env.DEV) {
                    console.warn('No collector for minimized boxes.')
                }
            }
            if (!skipUpdate) {
                console.log('[TeleBox] Emitting Events', { maximizedBoxes, minimizedBoxes,allBoxStatusInfo })
                this.events.emit(TELE_BOX_MANAGER_EVENT.AllBoxStatusInfo, allBoxStatusInfo)
            }
        })



        const state$ = combine(
            [this.allBoxStatusInfo$],
            ([allBoxStatusInfo]): TeleBoxState => {
                const minimizedBoxes = this.getMinimizedBoxes(allBoxStatusInfo)
                const maximizedBoxes = this.getMaximizedBoxes(allBoxStatusInfo)
                return minimizedBoxes.length
                    ? TELE_BOX_STATE.Minimized
                    : maximizedBoxes.length
                    ? TELE_BOX_STATE.Maximized
                    : TELE_BOX_STATE.Normal
            }
        )
        state$.reaction((state, _, skipUpdate) => {
            this.maxTitleBar.setState(state)
            if (!skipUpdate) {
                this.events.emit(TELE_BOX_MANAGER_EVENT.State, state)
            }
        })

        const fence$ = createVal(fence)
        fence$.subscribe((fence, _, skipUpdate) => {
            this.boxes$.value.forEach((box) => box.setFence(fence, skipUpdate))
        })

        const containerRect$ = createVal(containerRect, shallowequal)
        containerRect$.reaction((containerRect, _, skipUpdate) => {
            this.boxes$.value.forEach((box) => box.setContainerRect(containerRect, skipUpdate))
            this.maxTitleBar.setContainerRect(containerRect)
        })

        const collector$ = createVal(
            collector === null
                ? null
                : collector ||
                      new TeleBoxCollector({
                          visible: this.getMinimizedBoxes().length > 0 && !this.readonly,
                          readonly: readonly$.value,
                          namespace,
                          allBoxStatusInfo: this.allBoxStatusInfo$.value,
                          boxes: this.boxes$.value,
                          externalEvents: this.externalEvents,
                          appReadonly: this.appReadonly
                      }).mount(root)
        )
        collector$.subscribe((collector) => {
            if (collector) {
                collector.setVisible(this.getMinimizedBoxes().length > 0 && !readonly$.value)
                collector.setReadonly(readonly$.value)
                collector.setDarkMode(this._darkMode$.value)
                this._sideEffect.add(() => {
                    collector.onClick = (boxId) => {
                        console.log('[TeleBox] Collector Click Event', { boxId, readonly: readonly$.value })
                        if (!readonly$.value) {
                            const newMinimizedBoxes = removeByVal(
                                this.getMinimizedBoxes().filter(Boolean),
                                boxId
                            ) as string[]
                            console.log('[TeleBox] Collector Click - Setting Minimized Boxes', { boxId, newMinimizedBoxes })
                            const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
                            // 清除该box的最小化状态
                            if (allBoxStatusInfo[boxId] === TELE_BOX_STATE.Minimized) {
                                allBoxStatusInfo[boxId] = TELE_BOX_STATE.Normal
                            }
                            this.setAllBoxStatusInfo(allBoxStatusInfo)
                            this.externalEvents?.emit('OpenMiniBox', [])
                        }
                    }
                    return () => collector.destroy()
                }, 'collect-onClick')
            }
        })
        readonly$.subscribe((readonly) => {
            collector$.value?.setReadonly(readonly)
            collector$.value?.setVisible(this.getMinimizedBoxes().length > 0 && !readonly$.value)
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
            this.getMinimizedBoxes().length > 0 ? calcCollectorRect() : void 0
        )
        collectorRect$.subscribe((collectorRect, _, skipUpdate) => {
            this.boxes$.value.forEach((box) => {
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
            allBoxStatusInfo: this.allBoxStatusInfo$.value,
            onEvent: (event): void => {
                console.log('[TeleBox] MaxTitleBar Event Received', { eventType: event.type, focusedBox: this.maxTitleBar.focusedBox?.id })
                switch (event.type) {
                    case TELE_BOX_DELEGATE_EVENT.Maximize: {
                        console.log('[TeleBox] MaxTitleBar Maximize Event', { focusedBox: this.maxTitleBar.focusedBox?.id })
                        if (this.maxTitleBar.focusedBox?.id) {
                            const oldFocusId = this.maxTitleBar.focusedBox?.id
                            const currentMaximizedBoxes = this.getMaximizedBoxes()
                            const isInMaximizedBoxes = currentMaximizedBoxes.includes(oldFocusId)
                            const newMaximizedBoxes: string[] = isInMaximizedBoxes
                                ? removeByVal([...currentMaximizedBoxes], oldFocusId)
                                : uniqueByVal([
                                      ...currentMaximizedBoxes,
                                      this.maxTitleBar.focusedBox?.id
                                  ])

                            console.log('[TeleBox] MaxTitleBar Maximize - Setting Maximized Boxes', { 
                                oldFocusId, 
                                isInMaximizedBoxes, 
                                currentMaximized: currentMaximizedBoxes,
                                newMaximizedBoxes 
                            })
                            // 清理allBoxStatusInfo，只保留当前存在的boxes，并更新最大化状态
                            const allBoxStatusInfo = this.cleanAllBoxStatusInfo(this.allBoxStatusInfo$.value)
                            if (isInMaximizedBoxes) {
                                allBoxStatusInfo[oldFocusId] = TELE_BOX_STATE.Normal
                            } else {
                                allBoxStatusInfo[oldFocusId] = TELE_BOX_STATE.Maximized
                            }
                            console.log('[TeleBox] MaxTitleBar Maximize - Setting AllBoxStatusInfo', { 
                                oldFocusId, 
                                isInMaximizedBoxes, 
                                newState: allBoxStatusInfo[oldFocusId],
                                allBoxStatusInfo 
                            })
                            this.setAllBoxStatusInfo(allBoxStatusInfo)

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
                                const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
                                // 清除所有最大化状态
                                Object.keys(allBoxStatusInfo).forEach(boxId => {
                                    if (allBoxStatusInfo[boxId] === TELE_BOX_STATE.Maximized) {
                                        allBoxStatusInfo[boxId] = TELE_BOX_STATE.Normal
                                    }
                                })
                                this.setAllBoxStatusInfo(allBoxStatusInfo)
                            }
                        } else {
                            console.log('[TeleBox] MaxTitleBar Maximize - No Focused Box, Clearing Maximized')
                            const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
                            // 清除所有最大化状态
                            Object.keys(allBoxStatusInfo).forEach(boxId => {
                                if (allBoxStatusInfo[boxId] === TELE_BOX_STATE.Maximized) {
                                    allBoxStatusInfo[boxId] = TELE_BOX_STATE.Normal
                                }
                            })
                            this.setAllBoxStatusInfo(allBoxStatusInfo)
                        }
                        console.log('[TeleBox] MaxTitleBar Maximize - Emitting External Event')
                        this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.AllBoxStatusInfo, allBoxStatusInfo)
                        break
                    }
                    case TELE_BOX_DELEGATE_EVENT.Minimize: {
                        console.log('[TeleBox] MaxTitleBar Minimize Event', { focusedBox: this.maxTitleBar.focusedBox?.id })
                        if (this.maxTitleBar.focusedBox?.id) {
                            const currentMinimizedBoxes = this.getMinimizedBoxes()
                            const newMinimizedBoxes: string[] = uniqueByVal([
                                ...currentMinimizedBoxes,
                                this.maxTitleBar.focusedBox?.id
                            ])

                            console.log('[TeleBox] MaxTitleBar Minimize - Setting Minimized Boxes', { 
                                focusedBox: this.maxTitleBar.focusedBox?.id,
                                currentMinimized: currentMinimizedBoxes,
                                newMinimizedBoxes 
                            })

                            this.makeBoxTopFromMaximized()

                            // 清理allBoxStatusInfo，只保留当前存在的boxes，并设置该box为最小化状态
                            const allBoxStatusInfo = this.cleanAllBoxStatusInfo(this.allBoxStatusInfo$.value)
                            if (this.maxTitleBar.focusedBox?.id) {
                                allBoxStatusInfo[this.maxTitleBar.focusedBox.id] = TELE_BOX_STATE.Minimized
                            }
                            console.log('[TeleBox] MaxTitleBar Minimize - Setting AllBoxStatusInfo', { 
                                focusedBoxId: this.maxTitleBar.focusedBox?.id,
                                newState: this.maxTitleBar.focusedBox?.id ? allBoxStatusInfo[this.maxTitleBar.focusedBox.id] : undefined,
                                allBoxStatusInfo 
                            })
                            this.setAllBoxStatusInfo(allBoxStatusInfo)
                        }
                        console.log('[TeleBox] MaxTitleBar Minimize - Emitting External Event', this.getMinimizedBoxes())
                        this.externalEvents.emit(TELE_BOX_MANAGER_EVENT.AllBoxStatusInfo,allBoxStatusInfo )
                        break
                    }
                    case TELE_BOX_EVENT.Close: {
                        console.log('[TeleBox] MaxTitleBar Close Event', { focusedBox: this.maxTitleBar.focusedBox?.id })
                        const focusedId = this.maxTitleBar.focusedBox?.id
                        if (focusedId) {
                            console.log('[TeleBox] MaxTitleBar Close - Removing Box', { focusedId })
                            this.remove(focusedId)
                            this.makeBoxTopFromMaximized()
                            const currentMaximizedBoxes = this.getMaximizedBoxes()
                            const newMaximizedBoxes = removeByVal(currentMaximizedBoxes, focusedId)
                            console.log('[TeleBox] MaxTitleBar Close - Updating Maximized Boxes', { 
                                focusedId, 
                                currentMaximized: currentMaximizedBoxes,
                                newMaximizedBoxes 
                            })
                            // 清理allBoxStatusInfo，只保留当前存在的boxes，并清除该box的状态
                            const allBoxStatusInfo = this.cleanAllBoxStatusInfo(this.allBoxStatusInfo$.value)
                            delete allBoxStatusInfo[focusedId]
                            this.setAllBoxStatusInfo(allBoxStatusInfo)
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



        const valConfig: ValConfig = {
            prefersColorScheme: prefersColorScheme$,
            containerRect: containerRect$,
            collector: collector$,
            collectorRect: collectorRect$,
            readonly: readonly$,
            fence: fence$,
            allBoxStatusInfo: this.allBoxStatusInfo$
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

    protected allBoxStatusInfo$: Val<Record<string, TELE_BOX_STATE>>

    public readonly namespace: string

    public _darkMode$: Val<boolean, boolean>

    public get darkMode(): boolean {
        return this._darkMode$.value
    }

    public _state$: Val<TeleBoxState, boolean>

    public get state(): TeleBoxState {
        return this._state$.value
    }

    public get minimizedCount(): number {
        return this.getMinimizedBoxes().length
    }

    public get maximizedCount(): number {
        return this.getMaximizedBoxes().length
    }

    public setMinimized(data: boolean, skipUpdate = false): void {
        console.log('[TeleBox] SetMinimized Called', { data, skipUpdate })
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
        console.log('[TeleBox] SetMaximized Called', { data, skipUpdate })
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

    // 清理allBoxStatusInfo，只保留当前存在的boxes
    private cleanAllBoxStatusInfo(allBoxStatusInfo: Record<string, TELE_BOX_STATE>): Record<string, TELE_BOX_STATE> {
        const allBoxIds = this.boxes$.value.map((item) => item.id)
        const cleanedAllBoxStatusInfo = { ...allBoxStatusInfo }
        Object.keys(cleanedAllBoxStatusInfo).forEach(boxId => {
            if (!allBoxIds.includes(boxId)) {
                delete cleanedAllBoxStatusInfo[boxId]
            }
        })
        return cleanedAllBoxStatusInfo
    }

    public setAllBoxStatusInfo(allBoxStatusInfo: Record<string, TELE_BOX_STATE>, skipUpdate = false): void {
        console.log('[TeleBox] SetAllBoxStatusInfo Called', { 
            oldAllBoxStatusInfo: this.allBoxStatusInfo$.value,
            newAllBoxStatusInfo: allBoxStatusInfo, 
            skipUpdate 
        })
        
        // 清理allBoxStatusInfo，只保留当前存在的boxes
        const cleanedAllBoxStatusInfo = this.cleanAllBoxStatusInfo(allBoxStatusInfo)
        
        // 创建新的对象，避免直接修改传入的对象
        const newAllBoxStatusInfo = { ...cleanedAllBoxStatusInfo }
        this.allBoxStatusInfo$.setValue(newAllBoxStatusInfo)
        
        console.log('[TeleBox] SetAllBoxStatusInfo Completed', { 
            allBoxStatusInfo: this.allBoxStatusInfo$.value,
            maximizedBoxes: this.getMaximizedBoxes(),
            minimizedBoxes: this.getMinimizedBoxes()
        })
    }



    public getMaximizedBoxes(allBoxStatusInfo: Record<string, TELE_BOX_STATE> = this.allBoxStatusInfo$.value): string[] {
        return Object.entries(allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Maximized)
            .map(([boxId, _]) => boxId)
    }
    
    public getMinimizedBoxes(allBoxStatusInfo: Record<string, TELE_BOX_STATE> = this.allBoxStatusInfo$.value): string[] {
        return Object.entries(allBoxStatusInfo)
            .filter(([_, state]) => state === TELE_BOX_STATE.Minimized)
            .map(([boxId, _]) => boxId)
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

        // 对于新创建的box，检查当前是否有其他box处于最大化或最小化状态
        // 如果有其他box最大化，新box也应该最大化
        // 如果有其他box最小化，新box不应该最小化（除非明确指定）
        const currentMaximizedBoxes = this.getMaximizedBoxes()
        const currentMinimizedBoxes = this.getMinimizedBoxes()
        
        const managerMaximized$ = currentMaximizedBoxes.includes(id) || 
            (currentMaximizedBoxes.length > 0 && config.maximized !== false)
        
        const managerMinimized$ = currentMinimizedBoxes.includes(id) || 
            (config.minimized === true)

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
        
        // 更新allBoxStatusInfo，确保新创建的box状态被记录
        const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
        if (managerMaximized$) {
            allBoxStatusInfo[id] = TELE_BOX_STATE.Maximized
        } else if (managerMinimized$) {
            allBoxStatusInfo[id] = TELE_BOX_STATE.Minimized
        } else {
            allBoxStatusInfo[id] = TELE_BOX_STATE.Normal
        }
        console.log('[TeleBox] Create - Setting AllBoxStatusInfo for new box', { 
            boxId: id, 
            managerMaximized$, 
            managerMinimized$, 
            newState: allBoxStatusInfo[id],
            allBoxStatusInfo 
        })
        this.setAllBoxStatusInfo(allBoxStatusInfo)

        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Maximize, () => {
            console.log('[TeleBox] Box Maximize Event', { boxId: box.id })
            const allBoxIds = this.boxes$.value.map((item) => item.id)
            console.log('[TeleBox] Box Maximize - Setting All Boxes Maximized', { boxId: box.id, allBoxIds })
            // 清理allBoxStatusInfo，只保留当前存在的boxes，并将所有boxes设置为最大化
            const allBoxStatusInfo = this.cleanAllBoxStatusInfo(this.allBoxStatusInfo$.value)
            allBoxIds.forEach(boxId => {
                allBoxStatusInfo[boxId] = TELE_BOX_STATE.Maximized
            })
            console.log('[TeleBox] Box Maximize - Setting AllBoxStatusInfo', { 
                boxId: box.id, 
                allBoxIds,
                allBoxStatusInfo 
            })
            this.setAllBoxStatusInfo(allBoxStatusInfo)
            this.maxTitleBar.focusBox(box)
            console.log('[TeleBox] Box Maximize - Emitting External Event', [box.id])
            this.events.emit(TELE_BOX_MANAGER_EVENT.AllBoxStatusInfo,allBoxStatusInfo )
        })
        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Minimize, () => {
            console.log('[TeleBox] Box Minimize Event', { boxId: box.id })
            // 清理allBoxStatusInfo，只保留当前存在的boxes，并设置该box为最小化状态
            const allBoxStatusInfo = this.cleanAllBoxStatusInfo(this.allBoxStatusInfo$.value)
            allBoxStatusInfo[box.id] = TELE_BOX_STATE.Minimized
            console.log('[TeleBox] Box Minimize - Setting AllBoxStatusInfo', { 
                boxId: box.id, 
                newState: allBoxStatusInfo[box.id],
                allBoxStatusInfo 
            })
            this.setAllBoxStatusInfo(allBoxStatusInfo)
            console.log('[TeleBox] Box Minimize - Emitting External Event', [box.id])
            this.events.emit(TELE_BOX_MANAGER_EVENT.AllBoxStatusInfo,allBoxStatusInfo )
        })
        box._delegateEvents.on(TELE_BOX_DELEGATE_EVENT.Close, () => {
            console.log('[TeleBox] Box Close Event', { boxId: box.id })
            this.remove(box)
            this.makeBoxTopFromMaximized(box.id)
            this.focusTopBox()
            console.log('[TeleBox] Box Close - Emitting External Event', [box])
            this.events.emit(TELE_BOX_MANAGER_EVENT.Removed, [box])
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
            const list = this.boxes$.value.filter((item) => this.getMaximizedBoxes().includes(item.id)).sort((a, b) => b.zIndex - a.zIndex)
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
        this.boxes$.value.forEach((box) => {
            this.updateBox(box, config, skipUpdate)
        })
    }

    public remove(boxOrID: string | TeleBox, skipUpdate = false): ReadonlyTeleBox | undefined {
        console.log('[TeleBox] Remove Method Called', { boxOrID, skipUpdate })
        const index = this.getBoxIndex(boxOrID)
        if (index >= 0) {
            // 在删除box之前获取boxId
            const boxId = typeof boxOrID === 'string' ? boxOrID : boxOrID.id
            console.log('[TeleBox] Remove - Box ID', { boxId })
            
            const boxes = this.boxes.slice()
            const deletedBoxes = boxes.splice(index, 1)
            this.boxes$.setValue(boxes)
            deletedBoxes.forEach((box) => box.destroy())
            
            if (boxId) {
                console.log('[TeleBox] Remove - Updating Box Arrays', { boxId, currentMaximized: this.getMaximizedBoxes(), currentMinimized: this.getMinimizedBoxes() })
                const allBoxStatusInfo = { ...this.allBoxStatusInfo$.value }
                // 清除该box的状态
                delete allBoxStatusInfo[boxId]
                console.log('[TeleBox] Remove - Setting AllBoxStatusInfo after removing box', { 
                    boxId, 
                    allBoxStatusInfo 
                })
                this.setAllBoxStatusInfo(allBoxStatusInfo)
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
                    this.setAllBoxStatusInfo({})
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
                this.setAllBoxStatusInfo({})
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
            this.boxes$.value.forEach((box) => {
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
            if (this.getMaximizedBoxes().length > 0) {
                if (this.getMaximizedBoxes().includes(targetBox.id)) {
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
        this.boxes$.value.forEach((box) => {
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
                if (this.getMaximizedBoxes().includes(box.id)) {
                    const newIndex = this.topBox.zIndex + 1

                    const normalBoxesIds = excludeFromBoth(
                        this.boxes$.value.map((item) => item.id),
                        this.getMaximizedBoxes(),
                        this.getMinimizedBoxes()
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
        console.log('[TeleBox] MakeBoxTopFromMaximized Called', { boxId, currentMaximized: this.getMaximizedBoxes(), currentMinimized: this.getMinimizedBoxes() })
        let maxIndexBox = undefined
        if (boxId) {
            if (
                this.getMaximizedBoxes().includes(boxId) &&
                !this.getMinimizedBoxes().includes(boxId)
            ) {
                maxIndexBox = this.boxes$.value.find((box) => box.id === boxId)
                console.log('[TeleBox] MakeBoxTopFromMaximized - Found Specific Box', { boxId, maxIndexBox: maxIndexBox?.id })
            }
        } else {
            const nextFocusBoxes = this.boxes$.value.filter((box) => {
                return (
                    box.id != this.maxTitleBar.focusedBox?.id &&
                    this.getMaximizedBoxes().includes(box.id) &&
                    !this.getMinimizedBoxes().includes(box.id)
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
