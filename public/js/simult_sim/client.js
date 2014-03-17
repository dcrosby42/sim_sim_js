(function() {
  var Client,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Client = (function(_super) {
    __extends(Client, _super);

    function Client(adapter, gameEventFactory) {
      this.adapter = adapter;
      this.gameEventFactory = gameEventFactory;
      this.gameStarted = false;
      this.clientId = null;
      this.gameEventsBuffer = [];
      this.simulationEventsBuffer = [];
      this.adapter.on('ClientAdapter::Disconnect', (function(_this) {
        return function() {
          return _this.gameEventsBuffer.push(_this.gameEventFactory.disconnect());
        };
      })(this));
      this.adapter.on('ClientAdapter::Packet', (function(_this) {
        return function(data) {
          var msg;
          msg = _this._unpackServerMessage(data);
          switch (msg.type) {
            case 'ServerMsg::IdAssigned':
              return _this.clientId = msg.ourId;
            case 'ServerMsg::Event':
              return _this.simulationEventsBuffer.push(_this.simulationEventFactory.event(msg.sourcePlayerId, msg.data));
            case 'ServerMsg::PlayerJoined':
              return _this.simulationEventsBuffer.push(_this.simulationEventFactory.playerJoined(msg.playerId));
            case 'ServerMsg::PlayerLeft':
              return _this.simulationEventsBuffer.push(_this.simulationEventFactory.playerLeft(msg.playerId));
            case 'ServerMsg::TurnComplete':
              return console.log("TODO MOAR");
          }
        };
      })(this));
    }

    Client.prototype.update = function() {};

    Client.prototype._unpackServerMessage = function(data) {
      return data;
    };

    return Client;

  })(EventEmitter);

  window.SimultSim.Client = Client;

}).call(this);
