import { AppMenu, AppMenuProps } from "../AppMenu";
import { TELE_BOX_STATE, TeleBox, TeleBoxConfig, TeleBoxState } from "../TeleBox";
import "./styleNomal.scss";

export class CustomTeleBox extends TeleBox {
    public constructor(config: TeleBoxConfig) {
        super(config);
    }

    public setBoxStatus(boxStatus: TeleBoxState, skipUpdate?: boolean): this {
        super.setBoxStatus(boxStatus, skipUpdate);
        this.$box.classList.toggle("wk-titlebar-wrap-hide", boxStatus === TELE_BOX_STATE.Maximized);
        return this;
    }

    render(): HTMLElement {
        const div = super.render();
        this.$box.classList.add("wk-titlebar-wrap");
        return div;
    }

    /**
     * Render top box.
     * @param top - Whether to render top box.
     */
    renderTopBox(top: boolean) {
        this.$box.classList.toggle("wk-titlebar-wrap-top-focus", top);
    }
}

export class CustomAppMenu extends AppMenu {
    private hideMenuViewClickHandler = (event: Event) => {
        if (event.defaultPrevented || event.cancelBubble || !this.menuView) return;
        
        const target = event.target as Element;
        if (!this.menuView.contains(target) && getComputedStyle(this.menuView).display !== 'none') {
            this.containerClickHandler();
        }
    }

    public constructor(config: AppMenuProps) {
        super(config);
        // 直接添加事件监听器，使用捕获阶段监听
        document.addEventListener('click', this.hideMenuViewClickHandler, true);
    }

    destroy() {
        super.destroy();
        document.removeEventListener('click', this.hideMenuViewClickHandler);
    }
}