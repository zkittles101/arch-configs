const ObserverModule = function (fvdSynchronizer) {
  function observerHolder() {
    this.assigns = [];
  }
  observerHolder.prototype.registerCallback = function (eventName, callback) {
    fvdSynchronizer.Observer.registerCallback(eventName, callback);
    this.assigns.push({
      eventName: eventName,
      callback: callback,
    });
  };
  observerHolder.prototype.cleanUp = function (fvdSynchronizer) {
    this.assigns.forEach(function (assign) {
      fvdSynchronizer.Observer.unRegisterCallback(assign.eventName, assign.callback);
    });
  };
  fvdSynchronizer.Observer = new (function () {
    var callbacks = {};
    var singleEvents = {};
    var _lastEventId = 0;
    this.createHolder = function () {
      return new observerHolder();
    };
    this.createSingleEvent = function (callback) {
      var id = ++_lastEventId;
      id = 'single-event-' + id;
      singleEvents[id] = callback;
      return id;
    };
    this.fireSingleEvent = function (eventId, args) {
      if (singleEvents[eventId]) {
        singleEvents[eventId](args);
        delete singleEvents[eventId];
      }
    };
    this.registerCallback = function (eventName, callback) {
      if (!callbacks[eventName]) {
        callbacks[eventName] = [];
      }
      if (callbacks[eventName].indexOf(callback) != -1) {
        return; // already registered
      }
      callbacks[eventName].push(callback);
    };
    this.registerStruct = function (struct) {
      for (var everntName in struct) {
        this.registerCallback(everntName, struct[everntName]);
      }
    };
    this.unRegisterCallback = function (eventName, callback) {
      if (!callback[eventName]) {
        return; // no one callbacks has been registered for this event
      }
      var index = callbacks[eventName].indexOf(callback);
      if (index != -1) {
        callbacks[eventName].splice(index, 1);
      }
    };
    this.unRegisterStruct = function (struct) {
      for (var everntName in struct) {
        this.unRegisterCallback(everntName, struct[everntName]);
      }
    };
    this.fireEvent = function (eventName, args) {
      var removeCallbacks = [];
      if (callbacks[eventName]) {
        callbacks[eventName].forEach(function (callback) {
          try {
            callback(args);
          } catch (ex) {
            console.log('error in callback', ex, ex.stack);
            removeCallbacks.push(callback);
          }
        });
        removeCallbacks.forEach(function (callback) {
          var index = callbacks[eventName].indexOf(callback);
          callbacks[eventName].splice(index, 1);
        });
      }
    };
  })();
};
export default ObserverModule;
