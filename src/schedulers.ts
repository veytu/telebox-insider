export type AnyToVoidFunction = (...args: any[]) => void
export type NoneToVoidFunction = () => void

export type Scheduler = typeof requestAnimationFrame | typeof onTickEnd

let fastRafCallbacks: NoneToVoidFunction[] | undefined
let fastRafPrimaryCallbacks: NoneToVoidFunction[] | undefined

// May result in an immediate execution if called from another `requestAnimationFrame` callback
export function fastRaf(callback: NoneToVoidFunction, isPrimary = false): void {
  if (!fastRafCallbacks) {
    fastRafCallbacks = isPrimary ? [] : [callback]
    fastRafPrimaryCallbacks = isPrimary ? [callback] : []

    requestAnimationFrame(() => {
      const currentCallbacks = fastRafCallbacks
      const currentPrimaryCallbacks = fastRafPrimaryCallbacks
      fastRafCallbacks = undefined
      fastRafPrimaryCallbacks = undefined
      currentPrimaryCallbacks?.forEach((cb) => cb())
      currentCallbacks?.forEach((cb) => cb())
    })
  } else if (isPrimary) {
    fastRafPrimaryCallbacks?.push(callback)
  } else {
    fastRafCallbacks.push(callback)
  }
}

export function fastRafPrimary(callback: NoneToVoidFunction): void {
  fastRaf(callback, true)
}

let onTickEndCallbacks: NoneToVoidFunction[] | undefined
let onTickEndPrimaryCallbacks: NoneToVoidFunction[] | undefined

export function onTickEnd(callback: NoneToVoidFunction, isPrimary = false): void {
  if (!onTickEndCallbacks) {
    onTickEndCallbacks = isPrimary ? [] : [callback]
    onTickEndPrimaryCallbacks = isPrimary ? [callback] : []

    Promise.resolve().then(() => {
      const currentCallbacks = onTickEndCallbacks
      const currentPrimaryCallbacks = onTickEndPrimaryCallbacks
      onTickEndCallbacks = undefined
      onTickEndPrimaryCallbacks = undefined
      currentPrimaryCallbacks?.forEach((cb) => cb())
      currentCallbacks?.forEach((cb) => cb())
    })
  } else if (isPrimary) {
    onTickEndPrimaryCallbacks?.push(callback)
  } else {
    onTickEndCallbacks.push(callback)
  }
}

export function onTickEndPrimary(callback: NoneToVoidFunction): void {
  onTickEnd(callback, true)
}
