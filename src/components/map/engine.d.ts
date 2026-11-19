import type { Conversation, Person, Theme } from '@/lib/types';
type Ctl = { set(k: string, v: unknown): void; destroy(): void };
export function createMap(
  data: { themes: Theme[]; people: Person[]; conversations: Conversation[]; regions: string[] },
  navigate: (href: string) => void,
): { mountConstellation(el: HTMLElement, opts?: object): Ctl; mountGeo(el: HTMLElement, opts?: object): Ctl; MOBILE: MediaQueryList; TOUCH: MediaQueryList };
