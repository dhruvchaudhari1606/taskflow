import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `false` during SSR and the hydration pass, `true` afterwards.
 * Use it to gate browser-only UI (charts, drag-and-drop) without the
 * extra render caused by `useEffect(() => setMounted(true), [])`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
