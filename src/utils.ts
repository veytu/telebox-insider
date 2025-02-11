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
