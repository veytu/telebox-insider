import type { AnyToVoidFunction } from "../../schedulers"


export function createCallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction>(): {
    runCallbacks: (...args: any[]) => void
    addCallback: (cb: T) => void
    removeCallback: (cb: T) => void
    hasCallbacks: () => boolean
    removeAll: () => void
} {
  let callbacks = new Set<T>()

  function addCallback(cb: T) {
    callbacks.add(cb)

    return () => {
      removeCallback(cb)
    }
  }

  function removeCallback(cb: T) {
    callbacks.delete(cb)
  }

  function runCallbacks(...args: Parameters<T>) {
    callbacks.forEach((callback) => {
      callback(...args)
    })
  }

  function hasCallbacks() {
    return Boolean(callbacks.size)
  }

  function removeAll () {
    callbacks = new Set()
  }

  return {
    runCallbacks,
    addCallback,
    removeCallback,
    hasCallbacks,
    removeAll
  }
}

export type CallbackManager<T extends AnyToVoidFunction = AnyToVoidFunction> = ReturnType<
  typeof createCallbackManager<T>
>
