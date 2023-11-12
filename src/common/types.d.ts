interface EnhancedHTMLElement extends HTMLElement {
  getElement: (selectors: string) => EnhancedHTMLElement | null;
  getAllElements: (selectors: string) => EnhancedHTMLElement[];
  select: (
    strings: string[],
    ...values: string[]
  ) => EnhancedHTMLElement | null;
  getValue: (selectors: string) => string | undefined;
  setValue: (selectors: string, value: string | number) => void;
  getInt: (selectors: string) => number;
  addEventObserver: (
    eventName: string,
    eventHandler: (e: Event) => void,
    selector: string,
  ) => void;
}
