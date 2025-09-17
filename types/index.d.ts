
// Import required types for compatibility
import { Val } from "value-enhancer";

/**
 * TeleBox状态枚举
 */
declare enum TELE_BOX_STATE {
    Normal = "normal",
    Minimized = "minimized",
    Maximized = "maximized"
}

/**
 * TeleBox基础类型
 */
interface TeleBox {
    id: string;
    // Add other TeleBox properties as needed
}

/**
 * 悟空用户角色类型
 */
declare enum WukongUserRoleType {
    /** 老师 */
    teacher = 0,
    /** 助教 */
    assistant = 1,
    /** 巡课 */
    inspector = 2,
    /** 学生 */
    student = 3,
    /** 工单管理员 */
    admin = 4,
    /** 旁听生 */
    auditor = 5,
    /** 磨课机器人 */
    course_root = 6,
    /** 视频录制机器人 */
    recording_robot = 7
}
/**
 * 悟空角色别名类型
 */
type Role = WukongUserRoleType;

/**
 * 悟空角色管理器：
 * - 维护当前角色与是否为演讲者标记
 * - 动态判断是否具备操作权限（可配置“默认有权限的角色”）
 */
declare class WukongRoleManager {
    private wukongCurrentRole;
    private wukongPresenter;
    /** 默认具备操作权限的角色集合（不含演讲者，演讲者单独由 wukongPresenter 控制） */
    private wukongOperableRoles;
    constructor();
    /** 获取当前角色 */
    getRole(): WukongUserRoleType;
    /** 设置当前角色 */
    setRole(nextRole: WukongUserRoleType): void;
    /**
     * 是否具备操作权限（悟空）
     * 规则：演讲者 或 属于“默认有权限角色集合” => true，其余 => false
     */
    wukongCanOperate(): boolean;
    /**
     * 是否为演讲者权限
     */
    /** 是否为演讲者（悟空） */
    wukongIsPresenter(): boolean;
    /** 设置是否为演讲者（悟空） */
    wukongSetPresenter(isPresenter: boolean): void;
    /**
     * 设置“默认有操作权限”的角色集合（完全覆盖）
     * 例如：传入 [teacher, assistant, admin]
     */
    wukongSetOperableRoles(roles: WukongUserRoleType[]): void;
    /** 获取“默认有操作权限”的角色集合（快照） */
    wukongGetOperableRoles(): WukongUserRoleType[];
}
/**
 * 统一的 AllBoxStatusInfo 管理器
 * - 内部维护一份不可变思维的快照，所有变更返回新对象并同步到内部
 * - 提供清理/查询/设置等常用能力
 * - 支持 Observable 模式，外部可以监听状态变化
 */
declare class AllBoxStatusInfoManager {
    /** 当前所有的盒子状态信息 - Observable */
    private _currentAllBoxStatusInfo$;
    /** 当前所有的盒子最后非最小化状态信息 - Observable */
    private _lastNotMinimizedBoxsStatus$;
    /** 副作用管理器 */
    private _sideEffect;
    constructor();
    /** 获取当前盒子状态信息的 Observable */
    get currentAllBoxStatusInfo$(): Val<Record<string, TELE_BOX_STATE>, boolean>;
    /** 获取最后非最小化状态信息的 Observable */
    get lastNotMinimizedBoxsStatus$(): Val<Record<string, TELE_BOX_STATE>, boolean>;
    /** 设置当前所有的盒子状态信息 */
    setCurrentAllBoxStatusInfo(info: Record<string, TELE_BOX_STATE>, skipUpdate?: boolean): void;
    /** 根据盒子列表清理当前所有的盒子状态信息 */
    resetCleanCurrentAllBoxStatusInfoFromBoxes(boxes: TeleBox[], skipUpdate?: boolean): void;
    /** 根据盒子列表清理当前所有的盒子最后非最小化状态信息 */
    resetCleanLastNotMinimizedBoxsStatusFromBoxes(boxes: TeleBox[], skipUpdate?: boolean): void;
    /** 设置当前所有的盒子最后非最小化状态信息 */
    setLastNotMinimizedBoxsStatus(info: Record<string, TELE_BOX_STATE>, skipUpdate?: boolean): void;
    /** 设置当前指定的盒子状态信息 */
    setCurrentBoxState(boxId: string, state: TELE_BOX_STATE, skipUpdate?: boolean): void;
    /** 设置当前指定的盒子最后非最小化状态信息 */
    setLastNotMinimizedBoxState(boxId: string, state: TELE_BOX_STATE, skipUpdate?: boolean): void;
    /** 删除当前指定的盒子状态信息 */
    removeCurrentBoxState(boxId: string, skipUpdate?: boolean): void;
    /** 删除当前指定的盒子最后非最小化状态信息 */
    removeLastNotMinimizedBoxState(boxId: string, skipUpdate?: boolean): void;
    /** 清除当前所有的盒子状态信息 */
    clearCurrentAllBoxStatusInfo(skipUpdate?: boolean): void;
    /** 清除当前所有的盒子最后非最小化状态信息 */
    clearLastNotMinimizedBoxsStatus(skipUpdate?: boolean): void;
    /** 获取当前所有的盒子状态信息 */
    getAllBoxStatusInfo(): Record<string, TELE_BOX_STATE>;
    /**
     * 获取指定状态的盒子列表
     * @param type 状态类型
     * @returns
     */
    getBoxesList(type: TELE_BOX_STATE): string[];
    /**
     * 是否存在最大化的盒子
     * @returns 是否存在最大化的盒子
     */
    hasMaximizedBox(): boolean;
    /**
     * 是否存在最小化的盒子
     * @returns 是否存在最小化的盒子
     */
    hasMinimizedBox(): boolean;
    /**
     * 是否存在正常的盒子
     * @returns 是否存在正常的盒子
     */
    hasNormalBox(): boolean;
    /**
     * 获取最后非最小化状态的盒子列表
     * @returns 最后非最小化状态的盒子列表
     */
    getLastNotMinimizedBoxsStatus(): Record<string, TELE_BOX_STATE>;
    /**
     * 获取TeleBox标题栏状态
     * @returns TeleBox标题栏状态
     */
    getTeleBoxTitleBarState(): TELE_BOX_STATE;
    /**
     * 根据盒子列表设置当前盒子状态（用于 TeleBoxManager 中的调用）
     * @param boxes 盒子列表
     */
    setCurrentBoxStateFromBoxes(boxes: any[]): void;
    /**
     * 获取管理器实例（用于兼容现有代码）
     * @returns 管理器实例
     */
    get(): AllBoxStatusInfoManager;
    /**
     * 销毁管理器，清理所有副作用
     */
    destroy(): void;
}
