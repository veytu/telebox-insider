import './style.scss'
import collectorSVG from './icons/collector.svg'
import type { TeleStyles } from '../typings'
import type { TeleBox } from '../TeleBox'
import { createSideEffectBinder } from 'value-enhancer'
import type { Val } from 'value-enhancer'
import { SideEffectManager } from 'side-effect-manager'
import { onTickEnd } from '../schedulers'
import { getHiddenElementSize } from './utils'
import { isAndroid, isIOS } from '../utils'

export interface TeleBoxCollectorConfig {
    visible?: boolean
    readonly?: boolean
    darkMode?: boolean
    namespace?: string
    styles?: TeleStyles
    onClick?: () => void
    minimizedBoxes?: string[]
    boxes?: TeleBox[]
    externalEvents?: any
    appReadonly?: boolean
}

export class TeleBoxCollector {
    public constructor({
        visible = true,
        readonly = false,
        darkMode = false,
        namespace = 'telebox',
        styles = {},
        onClick,
        minimizedBoxes = [],
        boxes = [],
        externalEvents,
        appReadonly
    }: TeleBoxCollectorConfig = {}) {
        this.externalEvents = externalEvents
        this._sideEffect = new SideEffectManager()
        const { createVal } = createSideEffectBinder(this._sideEffect as any)
        this._visible = visible
        this._readonly = readonly
        this._darkMode = darkMode
        this.namespace = namespace
        this.styles = styles
        this.minimizedBoxes = minimizedBoxes
        this.boxes = boxes
        this.onClick = onClick
        this.appReadonly = appReadonly

        this.popupVisible$ = createVal(false)

        this.popupVisible$.reaction((popupVisible) => {
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
        })

        const blurPopup = (ev: PointerEvent): void => {
            if (!this.popupVisible$) return

            const target = ev.target as HTMLElement

            if (target.className?.includes?.('collector')) return

            this.popupVisible$.setValue(false)
        };
        this._sideEffect.addEventListener(
            window,
            "pointerdown",
            blurPopup,
            true
        );
    }

    public readonly styles: TeleStyles

    public readonly namespace: string
    private appReadonly: boolean | undefined

    public get visible(): boolean {
        return this._visible
    }

    public get readonly(): boolean {
        return this._readonly
    }

    public get darkMode(): boolean {
        return this._darkMode
    }

    private externalEvents: any

    public onClick: ((boxId: string) => void) | undefined

    public $collector: HTMLElement | undefined
    private wrp$: HTMLElement | undefined
    private count$: HTMLElement | undefined
    private $titles: HTMLElement | undefined
    protected root: HTMLElement | undefined

    /**
     * Mount collector to a root element.
     */
    public mount(root: HTMLElement): this {
        this.render(root)
        this.root = root
        return this
    }

    /**
     * Unmount collector from the root element.
     */
    public unmount(): this {
        if (this.$collector) {
            this.$collector.remove()
        }
        return this
    }

    public setVisible(visible: boolean): this {
        if (this._visible !== visible) {
            this._visible = visible
            if (this.$collector) {
                // this.$collector.classList.toggle(this.wrapClassName('collector-visible'), visible)
                this.wrp$?.classList.toggle(this.wrapClassName('collector-visible'), visible)
                if (!visible) {
                    this.popupVisible$.setValue(false)
                } else {
                    this.renderTitles()
                }
            }
        }
        return this
    }

    public setReadonly(readonly: boolean): this {
        if (this._readonly !== readonly) {
            this._readonly = readonly
            if (this.$collector) {
                this.$collector.classList.toggle(this.wrapClassName('collector-readonly'), readonly)
                this.wrp$?.classList.toggle(this.wrapClassName('collector-visible'), !readonly)
            }
        }
        return this
    }

    public setDarkMode(darkMode: boolean): this {
        if (this._darkMode !== darkMode) {
            this._darkMode = darkMode
            if (this.$collector) {
                this.$collector.classList.toggle(this.wrapClassName('color-scheme-dark'), darkMode)
                this.$collector.classList.toggle(
                    this.wrapClassName('color-scheme-light'),
                    !darkMode
                )
            }
        }
        return this
    }

    public setStyles(styles: TeleStyles): this {
        Object.assign(this.styles, styles)
        if (this.wrp$) {
            const $collector = this.wrp$
            Object.keys(styles).forEach((key) => {
                const value = styles[key as keyof TeleStyles] as string
                if (value != null) {
                    $collector.style[key as keyof TeleStyles] = value
                }
            })
        }
        return this
    }

    public setMinimizedBoxes(boxes: string[]): void {
        this.minimizedBoxes = boxes
        if (this.count$) {
            this.count$.textContent = String(this.minimizedBoxes?.length) || '0'
        }

        this.renderTitles()
    }

    public setBoxes (boxes: TeleBox[]):void {
        this.boxes = boxes
        this.renderTitles()
    }

    public render(root: HTMLElement): HTMLElement {
        if (isAndroid() || isIOS()) {
            const nonElement = document.createElement('div')
            nonElement.className = this.wrapClassName('collector-hide')
            return nonElement
        }
        if (!this.$collector) {
            this.$collector = document.createElement('button')
            this.$collector.className = this.wrapClassName('collector')
            this.$collector.style.backgroundImage = `url('${collectorSVG}')`
            this.wrp$ = document.createElement('div')
            this.count$ = document.createElement('div')

            this.wrp$.className = this.wrapClassName('collector-wrp')
            this.count$.className = this.wrapClassName('collector-count')

            this.wrp$.appendChild(this.count$)
            this.wrp$.appendChild(this.$collector)

            this.wrp$.addEventListener('click', this.handleCollectorClick)

            if (this._visible) {
                // this.$collector.classList.add(this.wrapClassName('collector-visible'))
                this.wrp$.classList.toggle(this.wrapClassName('collector-visible'))

                this.renderTitles();
            }

            if (this._readonly) {
                this.$collector.classList.add(this.wrapClassName('collector-readonly'))
            }

            this.$collector.classList.add(
                this.wrapClassName(this._darkMode ? 'color-scheme-dark' : 'color-scheme-light')
            )

            this.setStyles(this.styles)
            root.appendChild(this.wrp$)
        }

        return this.$collector
    }

    protected renderTitles(): HTMLElement {
        if (!this.$titles) {
            this.$titles = document.createElement('div')
            this.$titles.className = this.wrapClassName('collector-titles')

            this.$titles.classList.toggle(
                this.wrapClassName('collector-hide'),
                !this.popupVisible$.value
            )
        }

        this._sideEffect.addEventListener(
            this.$titles,
            'wheel',
            (ev) => {
                if (!ev.deltaX) {
                    (ev.currentTarget as HTMLElement).scrollBy({
                        left: ev.deltaY > 0 ? 250 : -250,
                        behavior: 'smooth'
                    })
                }
            },
            { passive: false },
            'min-popup-render-wheel-titles'
        )

        const existContent: HTMLDivElement = this.$titles.querySelector(
            `.${this.wrapClassName('collector-titles-content')}`
        ) as HTMLDivElement
        const $content: HTMLDivElement = existContent ?? document.createElement('div')
        $content.className = this.wrapClassName('collector-titles-content')
        if (!existContent) {
            this.$titles.appendChild($content)

            this._sideEffect.addEventListener(
                $content,
                'click',
                (ev) => {
                    const target = ev.target as HTMLElement
                    if (target.dataset?.teleBoxID?.length) {
                        this.onClick?.(target.dataset?.teleBoxID)
                    }
                },
                {},
                'telebox-collector-titles-content-click'
            )
        }

        $content.innerHTML = ''

        const disposers = this.boxes?.filter((box) => this.minimizedBoxes?.includes(box.id))
            .map((box) => {
                const $tab = document.createElement('button')
                $tab.className = this.wrapClassName('collector-titles-tab')
                $tab.textContent = box.title
                $tab.dataset.teleBoxID = box.id
                $tab.dataset.teleTitleBarNoDblClick = 'true'

                $content.appendChild($tab)

                return box._title$.reaction((title) => ($tab.textContent = title))
            })

        this._sideEffect.addDisposer(
            () => disposers?.forEach((disposer) => disposer()),
            'min-popup-render-tab-titles'
        )

        const existTitles = this.wrp$?.querySelector(
            `.${this.wrapClassName('collector-titles')}`
        )
        if (!existTitles) {
            this.wrp$?.appendChild(this.$titles)
        } else {
            this.wrp$?.replaceChild(this.$titles, existTitles)
        }

        onTickEnd(() => {
            if (!this.$titles) return
            if (!this.wrp$) return
            if (!this.root) return

            const parentRect = this.wrp$?.getBoundingClientRect()
            const rootRect = this.root?.getBoundingClientRect()
            const popupSize = getHiddenElementSize(this.$titles)

            const isAvailableSpaceTop = parentRect.top - rootRect.top > popupSize.height

            const topPosition = -popupSize.height - 10
            if (!isAvailableSpaceTop) {
                // const availableHeight = parentRect.top > 60 ? parentRect.top : 60
                // this.$titles.style.height = `${availableHeight}px`
            }


            this.$titles.style.top = `${topPosition}px`
            this.$titles.style.left = `0px`
        })

        return this.$titles
    }

    public destroy(): void {
        if (this.$collector) {
            this.$collector.removeEventListener('click', this.handleCollectorClick)
            this.$collector.remove()
            this.$collector = void 0
        }
        this.onClick = void 0
    }

    public wrapClassName(className: string): string {
        return `${this.namespace}-${className}`
    }

    protected _visible: boolean

    protected _readonly: boolean

    protected _darkMode: boolean
    protected minimizedBoxes: TeleBoxCollectorConfig['minimizedBoxes']
    protected boxes: TeleBoxCollectorConfig['boxes']

    protected handleCollectorClick = (): void => {
        if (!this._readonly && this.onClick) {
            this.popupVisible$.setValue(!this.popupVisible$.value)
        }
    }
    protected _sideEffect: SideEffectManager
    protected popupVisible$: Val<boolean>
}
