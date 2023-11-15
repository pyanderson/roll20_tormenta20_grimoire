'use strict';

/**
 * https://youmightnotneedjquery.com/#on
 * Add event listeners for the element or for the elements returned by the selector.
 *
 * @param {Object} props
 * @param {HTMLElement} props.el - The element.
 * @param {String} props.eventName - The event name.
 * @param {Function} props.eventHandler - The event handler that will be called when the event is triggered.
 * @param {String} [props.selector]
 */
export function addEventObserver({ el, eventName, eventHandler, selector }) {
  const handlers = [];
  if (selector) {
    const elements = el.querySelectorAll(selector);
    elements.forEach((childEl) => {
      class WrappedHandler {
        handleEvent(e) {
          if (e.type === eventName) {
            eventHandler.call(el, e);
          }
        }
      }
      const wrappedHandler = new WrappedHandler();
      handlers.push(wrappedHandler);
      childEl.addEventListener(eventName, wrappedHandler);
    });
    return handlers;
  }
  class WrappedHandler {
    handleEvent(e) {
      if (e.type === eventName) {
        eventHandler.call(el, e);
      }
    }
  }
  const wrappedHandler = new WrappedHandler();
  el.addEventListener(eventName, wrappedHandler);
  handlers.push(wrappedHandler);
  return handlers;
}

/**
 * Creates a HTML element.
 *
 * @param {String} tagName - A string that specifies the type of element to be created.
 * @param {Object} [attributes={}] - A object with the attributes to be assigned to the new element.
 * @returns {EnhancedHTMLElement}
 */
export function createElement(tagName, attributes = {}) {
  const newElement = document.createElement(tagName);
  const { id, name, classes, append, colspan, draggable, ...other } =
    attributes;
  Object.entries({ id, name, class: classes, colspan, draggable }).forEach(
    ([key, value]) => {
      if (key && value) newElement.setAttribute(key, value);
    },
  );
  Object.assign(newElement, other);
  if (append && append.length > 0) newElement.append(...append);
  return enhanceElement(newElement);
}

/**
 * Returns the first element that is a descendant of the document or element that matches the specified selectors path.
 *
 * @param {Object} props
 * @param {HTMLDocument|HTMLElement} props.root - The document are element to be used in the search
 * @param {string[]} props.path - List of selectors to be used to search the element
 * @returns {HTMLElement|null}
 */
export function pathQuerySelector({ root, path }) {
  if (!root) return null;
  if (path.length === 0) return enhanceElement(root);
  return pathQuerySelector({
    root: root.querySelector(path[0].trim()),
    path: path.slice(1),
  });
}

/**
 * Slugfy a string.
 *
 * @param {String} s
 * @returns {String}
 */
export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .trim();
}

/**
 * Update the value attribute if the selector returns a valid element.
 *
 * @param {Object} props
 * @param {String} props.selector - The selector.
 * @param {String} props.value - The new value.
 * @param {HTMLDocument|HTMLElement} [props.origin=document]
 * @returns {HTMLElement|null}
 */
export function setInputValue({ selector, value, origin = document }) {
  const el = origin.querySelector(selector);
  if (!el) return null;
  el.focus();
  el.value = value;
  return el;
}

/**
 * Check if a iframe has a css applied.
 *
 * @param {Object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {String} props.url
 * @returns {boolean}
 */
export function hasCSS({ iframe, url }) {
  const links = iframe.querySelectorAll('link[rel="stylesheet"]');
  return Boolean(
    Array.from(links).find((link) => {
      return link.href === url;
    }),
  );
}

/**
 * Normalize a string.
 *
 * @param {String} s
 * @returns {String}
 */
export function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Clear all children elements.
 *
 * @param {Object} props
 * @param {HTMLElement} props.el - The element to be clear.
 */
export function clearChildren({ el }) {
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
}

/**
 * Generate Roll20 UUID.
 *
 * @returns {String}
 */
export function generateUUID() {
  const source =
    '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  const getFirstPart = (part, seed) => {
    if (seed === 0) return `-${part}`;
    return getFirstPart(
      `${source.charAt(seed % 64)}${part}`,
      Math.floor(seed / 64),
    );
  };
  const getSecondPart = (part, size) => {
    if (part.length === size) return part;
    return getSecondPart(
      `${part}${source.charAt(Math.floor(64 * Math.random()))}`,
      size,
    );
  };
  return `${getFirstPart('', new Date().getTime())}${getSecondPart('', 12)}`;
}

/**
 * Wait until a condition is true or finish the number of attempts.
 *
 * @param {Object} props
 * @param {Function} props.checkFn
 * @param {Function} props.checkCallback
 * @param {Number} [props.attempts=-1]
 * @param {Number} [props.interval=500]
 */
export function waitForCondition({
  checkFn,
  callbackFn,
  attempts = -1,
  interval = 500,
}) {
  return new Promise((resolve) => {
    const checkCallback = () => {
      if (checkFn()) {
        if (callbackFn) {
          resolve(callbackFn());
        } else {
          resolve();
        }
      } else if (attempts === -1 || attempts > 0) {
        attempts--;
        setTimeout(checkCallback, interval);
      }
    };
    checkCallback();
  });
}

/**
 * Wait until the window object has a valid value for the attribute.
 *
 * @param {String} attributeName
 */
export function waitForWindowAttribute(attributeName) {
  return waitForCondition({
    checkFn: () =>
      Object.prototype.hasOwnProperty.call(window, attributeName) &&
      window[attributeName] !== undefined,
    callbackFn: () => window[attributeName],
  });
}

/**
 * Add extra methods to a HTMLElement.
 *
 * @param {HTMLElement} el
 * @returns {EnhancedHTMLElement}
 */
export function enhanceElement(el) {
  if (!el) return null;
  el.getElement = (s) =>
    s ? pathQuerySelector({ root: el, path: s.split('>') }) : el;
  el.getAllElements = (s) =>
    Array.from(el.querySelectorAll(s)).map((node) => enhanceElement(node));
  el.select = (strings, ...values) =>
    el.getElement(
      strings.reduce((acc, s, index) => acc + s + (values[index] || ''), ''),
    );
  el.getValue = (selectors) => el.getElement(selectors)?.value;
  el.setValue = (selectors, value) => {
    const child = el.getElement(selectors);
    if (child) {
      child.value = value;
    }
  };
  el.getInt = (selectors) => parseInt(el.getElement(selectors)?.value) || 0;
  el.addEventObserver = (eventName, eventHandler, selector) =>
    addEventObserver({ el, eventName, eventHandler, selector });
  return el;
}

/**
 * Make a copy of a object without references.
 *
 * @param {Object} obj
 * @returns {Object}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * https://stackoverflow.com/a/30800715
 *
 * @param {Object} obj
 * @param {String} name
 */
export function downloadObjectAsJson(obj, name) {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', name + '.json');
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

/**
 * Returns the object reversed from [key]: value to [value]: key.
 *
 * @param {Object} obj
 * @returns {Object}
 */
export function reverseObj(obj) {
  return Object.keys(obj).reduce(
    (acc, key) => ({ ...acc, [obj[key]]: key }),
    {},
  );
}
