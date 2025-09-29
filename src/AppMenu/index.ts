import './style.scss';
import { TeleBoxManager } from '../TeleBoxManager';
import { TeleBoxColorScheme, TeleBoxState, TELE_BOX_STATE } from '..';

export type AppId = string;

export interface AppMenuProps {
  manager: TeleBoxManager;
  container: HTMLDivElement;
  theme: TeleBoxColorScheme;
  getBoxesStatus?: () => Map<string, TeleBoxState>;
}

export class AppMenu {
  private readonly namespace: string = 'telebox-app-menu';
  private container: HTMLDivElement;
  private readonly badge: HTMLDivElement = document.createElement('div');
  protected readonly menuView: HTMLDivElement = document.createElement('div');
  private readonly manager: TeleBoxManager;
  private theme: TeleBoxColorScheme;
  private getBoxesStatus?: () => Map<string, TeleBoxState>;

  constructor(props: AppMenuProps) {
    this.container = props.container;
    this.manager = props.manager;
    this.theme = props.theme;
    this.getBoxesStatus = props.getBoxesStatus;
    this.init();
  }

  get boxesStatus(): Map<string, TeleBoxState> {
    return this.getBoxesStatus?.() || new Map();
  }

  get minimizedBoxesStatus(): TeleBoxState[] {
    const arr: TeleBoxState[] = [];
    this.boxesStatus.forEach((status) => {
      if (status === TELE_BOX_STATE.Minimized) {
        arr.push(status);
      }
    });
    return arr;
  }

  private c(className: string): string {
    return `${this.namespace}-${className}`;
  }

  public containerClickHandler = () => {
    if (this.manager.readonly) {
      return;
    }
    const isShowMenuView = getComputedStyle(this.menuView).display === 'flex';
    if (isShowMenuView) {
      this.menuView.style.display = 'none';
    } else {
      this.menuView.style.display = 'flex';
    }
  };

  private menuViewClickHandler = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target as HTMLElement;
    const id = target.getAttribute(`data-${this.c('app-id')}`);
    if (id) {
        const lastNotMinimizedBoxStatus = this.manager.getLastNotMinimizedBoxStatus(id) || TELE_BOX_STATE.Normal;
        const zIndex = (lastNotMinimizedBoxStatus===TELE_BOX_STATE.Maximized ? this.manager.getMaxMaximizedBoxZIndex() : this.manager.getMaxNormalBoxZIndex()) + 1;
        this.manager.setBox(id, {
          status: lastNotMinimizedBoxStatus,
          zIndex
        }, false, ()=>{
          this.manager.focusBox(id);
        })
        return;
    }
  };

  public setContainer(container: HTMLDivElement){
    if(this.container) {
      this.container.remove();
    }
    this.container = container;
    this.init();
  }

  private createDefaultAppMenu(){
    this.badge.classList.add(this.c('app-menu-badge'));
    this.menuView.classList.add(this.c('app-menu-tooltip'));
    this.container.classList.add(this.c('app-menu-container'), this.theme);
    this.menuView.addEventListener('click', this.menuViewClickHandler);
    this.container.append(this.badge, this.menuView);
  }

  private async init(){
    this.createDefaultAppMenu();
    this.appMenuChange();
  }

    updatePrefersColorSchemeHandler = () => {
        this.container.classList.remove(this.theme);
        this.theme = this.manager.prefersColorScheme;
        this.container.classList.add(this.theme);
    };

    appMenuChange = () => {
        const minimizedBoxesStatus = this.manager.getMinimizedBoxesStatus();
        this.render(minimizedBoxesStatus);
    }

  private createMinimizedItem(appId: AppId){
    const appItem = document.createElement('div');
    appItem.classList.add(this.c('app-menu-item'));
    appItem.setAttribute(`data-${this.c('app-id')}`, appId);
    const titleDiv = document.createElement('div');
    titleDiv.classList.add(this.c('app-menu-item-title'));
    const app = this.manager.getBox(appId);
    titleDiv.innerText = app?.title || appId;
    appItem.appendChild(titleDiv);
    return appItem;
  }

  private renderMenuView(minimizedBoxesStatus: Map<AppId, TELE_BOX_STATE.Minimized>){
    const items: HTMLDivElement[] = [];
    minimizedBoxesStatus.forEach((_, appId) => {
      items.push(this.createMinimizedItem(appId));
    });
    this.menuView.append(...items);
  }

  render(minimizedBoxesStatus: Map<AppId, TELE_BOX_STATE.Minimized>) {
    this.menuView.style.display = 'none';
    this.badge.innerText = '';
    this.menuView.innerHTML = '';
    if (minimizedBoxesStatus.size === 0) {
      this.container.style.display = 'none';
    } else {
      this.badge.innerText = minimizedBoxesStatus.size.toString();
      this.renderMenuView(minimizedBoxesStatus);
      this.container.style.display = 'block';
    }
  }
  destroy(){

    this.badge.remove();
    this.menuView.removeEventListener('click', this.menuViewClickHandler);
    this.menuView.remove();
    this.container.remove();
    // this.removeContainer();
  }
}

