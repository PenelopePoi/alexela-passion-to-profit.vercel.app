import { useEffect } from 'react';
export type StudioAction = 'save' | 'export';
const eventName = (action: StudioAction) => `alexela:studio:${action}`;
export function dispatchStudioAction(action: StudioAction) {
  window.dispatchEvent(new Event(eventName(action)));
}
export function useStudioAction(action: StudioAction, handler: () => void) {
  useEffect(() => {
    window.addEventListener(eventName(action), handler);
    return () => window.removeEventListener(eventName(action), handler);
  }, [action, handler]);
}
