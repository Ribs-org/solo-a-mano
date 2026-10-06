import { vi } from "vitest";

// IntersectionObserver falso para jsdom: guarda cada instancia para poder
// simular que un elemento entra o sale de la pantalla.
export class FakeObserver {
  static instances: FakeObserver[] = [];
  elements: Element[] = [];
  disconnect = vi.fn();
  constructor(public callback: IntersectionObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(el: Element) { this.elements.push(el); }
  unobserve(el: Element) { this.elements = this.elements.filter((e) => e !== el); }
  trigger(el: Element, isIntersecting: boolean) {
    this.callback([{ target: el, isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

export function installFakeObserver() {
  FakeObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", FakeObserver);
}
