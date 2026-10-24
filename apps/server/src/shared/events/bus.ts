import { EventEmitter } from "node:events";
import type { DomainEvents } from "./types";

class EventBus extends EventEmitter {
  emit<K extends keyof DomainEvents>(
    event: K,
    payload: DomainEvents[K],
  ): boolean {
    return super.emit(event, payload);
  }
  on<K extends keyof DomainEvents>(
    event: K,
    listener: (payload: DomainEvents[K]) => void,
  ): this {
    return super.on(event, listener);
  }
  off<K extends keyof DomainEvents>(
    event: K,
    listener: (payload: DomainEvents[K]) => void,
  ): this {
    return super.off(event, listener);
  }
}

export const eventBus = new EventBus();
eventBus.setMaxListeners(20); // default 10 is easy to hit once audit + realtime + more both listen per event
