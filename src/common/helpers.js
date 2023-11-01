'use strict';

/**
 * https://youmightnotneedjquery.com/#on
 * Add event listeners for the element or for the elements returned by the selector.
 *
 * @param {object} props
 * @param {HTMLElement} props.el - The element.
 * @param {string} props.eventName - The event name.
 * @param {function} props.eventHandler - The event handler that will be called when the event is triggered.
 * @param {string} [props.selector]
 */
// eslint-disable-next-line no-unused-vars
function addEventObserver({ el, eventName, eventHandler, selector }) {
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
 * @param {string} tagName - A string that specifies the type of element to be created.
 * @param {object} [attributes={}] - A object with the attributes to be assigned to the new element.
 * @returns {HTMLElement}
 */
// eslint-disable-next-line no-unused-vars
function createElement(tagName, attributes = {}) {
  const newElement = document.createElement(tagName);
  const { id, name, classes, append, colspan, ...other } = attributes;
  Object.entries({ id, name, class: classes, colspan }).forEach(
    ([key, value]) => {
      if (key && value) newElement.setAttribute(key, value);
    },
  );
  Object.assign(newElement, other);
  if (append && append.length > 0) newElement.append(...append);
  return newElement;
}

/**
 * Returns the first element that is a descendant of the document or element that matches the specified selectors path.
 *
 * @param {object} props
 * @param {HTMLDocument|HTMLElement} props.root - The document are element to be used in the search
 * @param {string[]} props.path - List of selectors to be used to search the element
 * @returns {HTMLElement|null}
 */
// eslint-disable-next-line no-unused-vars
function pathQuerySelector({ root, path }) {
  if (!root) return null;
  if (path.length === 0) return root;
  return pathQuerySelector({
    root: root.querySelector(path[0]),
    path: path.slice(1),
  });
}

/**
 * Slugfy a string.
 *
 * @param {string} s
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .trim();
}

/**
 * Update the value attribute if the selector returns a valid element.
 *
 * @param {object} props
 * @param {string} props.selector - The selector.
 * @param {string} props.value - The new value.
 * @param {HTMLDocument|HTMLElement} [props.origin=document]
 * @returns {HTMLElement|null}
 */
// eslint-disable-next-line no-unused-vars
function setInputValue({ selector, value, origin = document }) {
  const el = origin.querySelector(selector);
  if (!el) return null;
  el.focus();
  el.value = value;
  return el;
}

/**
 * Check if a iframe has a css applied.
 *
 * @param {object} props
 * @param {HTMLDocument} props.iframe - The character sheet iframe document.
 * @param {string} props.url
 * @returns {boolean}
 */
// eslint-disable-next-line no-unused-vars
function hasCSS({ iframe, url }) {
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
 * @param {string} s
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Clear all children elements.
 *
 * @param {object} props
 * @param {HTMLElement} props.el - The element to be clear.
 */
// eslint-disable-next-line no-unused-vars
function clearChildren({ el }) {
  while (el.firstChild) {
    el.removeChild(el.lastChild);
  }
}

/**
 * Generate Roll20 UUID.
 *
 * @returns {string}
 */
// eslint-disable-next-line no-unused-vars
function generateUUID() {
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
