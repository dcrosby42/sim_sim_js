(function() {
  var EventEmitter, SocketIOClientAdapter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('./event_emitter.coffee');

  SocketIOClientAdapter = (function(_super) {
    __extends(SocketIOClientAdapter, _super);

    function SocketIOClientAdapter(socket) {
      this.socket = socket;
      this.socket.on('data', (function(_this) {
        return function(data) {
          return _this.emit('ClientAdapter::Packet', data);
        };
      })(this));
      this.socket.on('disconnect', (function(_this) {
        return function() {
          return _this.emit('ClientAdapter::Disconnect');
        };
      })(this));
    }

    SocketIOClientAdapter.prototype.send = function(data) {
      return this.socket.emit('data', data);
    };

    SocketIOClientAdapter.prototype.disconnect = function() {
      return this.socket.disconnect();
    };

    return SocketIOClientAdapter;

  })(EventEmitter);

  module.exports = SocketIOClientAdapter;

}).call(this);
