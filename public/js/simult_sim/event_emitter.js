(function() {
  var EventEmitter,
    __slice = [].slice;

  EventEmitter = (function() {
    function EventEmitter() {}

    EventEmitter.prototype.on = function(event, f) {
      return this._getListeners(event).push(f);
    };

    EventEmitter.prototype.emit = function() {
      var args, event, f, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      _ref = this._getListeners(event);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        f.apply(null, args);
      }
      return null;
    };

    EventEmitter.prototype._getListeners = function(event) {
      var _base;
      this._listeners || (this._listeners = {});
      (_base = this._listeners)[event] || (_base[event] = []);
      return this._listeners[event];
    };

    return EventEmitter;

  })();

  if (typeof window !== 'undefined') {
    window.SimultSim.EventEmitter = EventEmitter;
  }

  if (typeof module !== 'undefined') {
    module.exports = EventEmitter;
  }

}).call(this);
