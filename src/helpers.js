/*
 * https://youmightnotneedjquery.com/#on
 * Add event listeners for the element or for the elements returned by the selector.
 *
 * @param {HTMLElement} el - The element.
 * @param {string} eventName - The event name.
 * @param {function} eventHandler - The event handler that will be called when the event is triggered.
 * @param {object} options - A object that accepts the following attributes.
 * @param {string} [options.selector]
 * */
function addEventObserver(el, eventName, eventHandler, options = {}) {
  const handlers = [];
  if (options.selector) {
    const elements = el.querySelectorAll(options.selector);
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

/*
 * Creates a HTML element.
 *
 * @param {string} tagName - A string that specifies the type of element to be created.
 * @param {object} [attributes={}] - A object with the attributes to be assigned to the new element.
 * @returns {HTMLElement}
 * */
function createElement(tagName, attributes = {}) {
  const newElement = document.createElement(tagName);
  const { id, name, classes, append, ...other } = attributes;
  Object.entries({ id, name, class: classes }).forEach(([key, value]) => {
    if (key && value) newElement.setAttribute(key, value);
  });
  Object.assign(newElement, other);
  if (append && append.length > 0) newElement.append(...append);
  return newElement;
}

/*
 * Returns the first element that is a descendant of the document or element that matches the specified selectors path.
 *
 * @param {HTMLDocument|HTMLElement} root - The document are element to be used in the search
 * @param {string[]} path - List of selectors to be used to search the element
 * @returns {HTMLElement|null}
 * */

function pathQuerySelector(root, path) {
  if (!root) return null;
  if (path.length === 0) return root;
  return pathQuerySelector(root.querySelector(path[0]), path.slice(1));
}

/*
 * Slugfy a string.
 *
 * @param {string} s
 * @returns {string}
 * */
function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .trim();
}

/*
 * Update the value attribute if the selector returns a valid element
 *
 * @param {string} selector - The selector.
 * @param {string} value - The new value.
 * @param {HTMLDocument|HTMLElement} [origin=document]
 * @returns {HTMLElement|null}
 * */

function setValue(selector, value, origin = document) {
  const el = origin.querySelector(selector);
  if (!el) return null;
  el.focus();
  el.value = value;
  return el;
}
