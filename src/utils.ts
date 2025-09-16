export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function preventEvent(ev: Event): void {
    ev.stopPropagation();
    if (ev.cancelable) {
        ev.preventDefault();
    }
}

export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let defaultBoxCount = 1;

export function getBoxDefaultName(): string {
    return `New Box ${defaultBoxCount++}`;
}

export function identity<TValue>(value: TValue): TValue {
    return value;
}

export function isTruthy<TValue>(value: TValue): boolean {
    return Boolean(value);
}

export function isFalsy<TValue>(value: TValue): boolean {
    return !value;
}

export function findMaxItem<TValue>(arr: TValue[], key: keyof TValue): TValue {
    const max = arr.reduce((maxItem, current) => {
        return current[key] > maxItem[key] ? current : maxItem;
    });

    return max;
}

export function uniqueByObjectKey<TValue>(
    arr: TValue[],
    key: keyof TValue
): TValue[] {
    return arr.reduce((acc, item) => {
        if (!acc.find((j) => j[key] == item[key])) acc.push(item);
        return acc;
    }, [] as TValue[]);
}

export function uniqueByVal<T>(arr: T[]): T[] {
    return arr.reduce((acc, item) => {
        if (!acc.includes(item)) acc.push(item);
        return acc;
    }, [] as T[]);
}

export function removeByVal<T>(arr: T[], val: T): T[] {
    const index = arr.indexOf(val);

    if (index < 0) {
        return arr;
    }

    const newArr = [...arr];

    newArr.splice(index, 1);

    return newArr;
}

export function removeByIndex(arr: any[], index: number): any[] {
    const newArr = [...arr];

    if (index < 0 || index > arr.length) return arr;

    newArr.splice(index, 1);

    return newArr;
}

export function removeValues<T>(array: T[], valuesToRemove: T[]): T[] {
    return array.filter((item) => !valuesToRemove.includes(item));
}

export function excludeFromBoth<T>(c: T[], a: T[], b: T[]): T[] {
    const aSet = new Set(a);
    const bSet = new Set(b);
    return c.filter((item) => !aSet.has(item) && !bSet.has(item));
}

export const isIOS = (): boolean => {
    return (
        typeof navigator !== "undefined" &&
        typeof window !== "undefined" &&
        /iPad|iPhone|iPod/.test(window.navigator.userAgent)
    );
};

export const isAndroid = (): boolean => {
    return (
        typeof navigator !== "undefined" &&
        /Android/.test(window.navigator.userAgent)
    );
};

export function flattenEvent(ev: MouseEvent | TouchEvent): MouseEvent | Touch {
    return (ev as TouchEvent).touches
        ? (ev as TouchEvent).touches[0]
        : (ev as MouseEvent);
}

export function genUniqueKey(): string {
    return (
        Date.now().toString().slice(6) + Math.random().toString().slice(2, 8)
    );
}
