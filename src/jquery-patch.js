'use strict'

// https://stackoverflow.com/a/49023264
function add_on_create_event() {
  const observers = [];
  $.event.special.create = {

    setup: function setup() {
      const observer = new MutationObserver(callback);
      observers.push([this, observer, []]);
    },

    teardown: function teardown() {
      const obs = getObserverData(this);
      obs[1].disconnect();
      observers = $.grep(observers, function (item) {
        return item !== obs;
      });
    },

    remove: function remove(handleObj) {
      const obs = getObserverData(this);
      obs[2] = obs[2].filter(function (event) {
        return event[0] !== handleObj.selector && event[1] !== handleObj.handler;
      });
    },

    add: function add(handleObj) {
      const obs = getObserverData(this);
      const config = $.extend({}, {
        attributes: false,
        childList: true,
        subtree: true
      }, handleObj.data);
      obs[1].observe(this, config);
      obs[2].push([handleObj.selector, handleObj.handler]);
    }
  };

  function getObserverData(element) {
    const $el = $(element);
    return $.grep(observers, function (item) {
      return $el.is(item[0]);
    })[0];
  }

  function callback(records, observer) {
    const obs = $.grep(observers, function (item) {
      return item[1] === observer;
    })[0];
    const triggers = obs[2];
    const changes = [];
    records.forEach(function (record) {
      if (record.type === 'attributes') {
        if (changes.indexOf(record.target) === -1) {
          changes.push(record.target);
        }
        return;
      }
      $(record.addedNodes).toArray().forEach(function (el) {
        if (changes.indexOf(el) === -1) {
          changes.push(el);
        }
      })
    });
    triggers.forEach(function checkTrigger(item) {
      changes.forEach(function (el) {
        const $el = $(el);
        if ($el.is(item[0])) {
          $el.trigger('create');
        }
      });
    });
  }
}

$(document).ready(function () {
  add_on_create_event();
});
