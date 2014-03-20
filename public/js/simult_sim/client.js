(function() {
  var Client, EventEmitter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter = require('./event_emitter');

  Client = (function(_super) {
    __extends(Client, _super);

    function Client(adapter, gameEventFactory, clientMessageFactory) {
      this.adapter = adapter;
      this.gameEventFactory = gameEventFactory;
      this.clientMessageFactory = clientMessageFactory;
      this.gameStarted = false;
      this.clientId = null;
      this.simulationEventsBuffer = [];
      this.gameEventsBuffer = [];
      this.preGameEventsBuffer = [];
      this.adapter.on('ClientAdapter::Disconnect', (function(_this) {
        return function() {
          return _this.gameEventsBuffer.push(_this.gameEventFactory.disconnect());
        };
      })(this));
      this.adapter.on('ClientAdapter::Packet', (function(_this) {
        return function(data) {
          var f, gameEvent, i, msg, protoTurn, simEvent, turnEvents, _i, _j, _len, _ref, _ref1;
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
              turnEvents = [];
              for (i = _i = 1, _ref = _this.simulationEventsBuffer.length; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
                turnEvents.push(_this.simulationEventsBuffer.shift());
              }
              f = function(checksum) {
                return this._sendMessage(this.clientMessageFactory.turnFinished(msg.turnNumber, checksum));
              };
              return _this.gameEventsBuffer.push(_this.gameEventFactory.turnComplete(msg.turnNumber, turnEvents, f));
            case 'ServerMsg::StartGame':
              _this.gameStarted = true;
              _ref1 = _this._unpackProtoTurn(msg.protoTurn);
              for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
                simEvent = _ref1[_j];
                _this.simulationEventsBuffer.push(simEvent);
              }
              return _this.preGameEventsBuffer.push(_this.gameEventFactory.startGame(msg.yourId, msg.turnPeriod, msg.currentTurn, msg.gamestate));
            case 'ServerMsg::GamestateRequest':
              protoTurn = _this._packProtoTurn(_this.simulationEventsBuffer);
              f = function(gamestate) {
                return this._sendMessage(this.clientMessageFactory.gamestate(msg.forPlayerId, protoTurn, gamestate));
              };
              gameEvent = _this.gameEventFactory.gamestateRequest(f);
              if (_this.gameStarted) {
                return _this.gameEventsBuffer.push(gameEvent);
              } else {
                return _this.preGameEventsBuffer.push(gameEvent);
              }
          }
        };
      })(this));
    }

    Client.prototype.update = function(callback) {
      var i, _i, _j, _ref, _ref1, _results;
      for (i = _i = 1, _ref = this.preGameEventsBuffer.length; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        callback(this.preGameEventsBuffer.shift());
      }
      if (this.gameStarted) {
        _results = [];
        for (i = _j = 1, _ref1 = this.gameEventsBuffer.length; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 1 <= _ref1 ? ++_j : --_j) {
          _results.push(callback(this.gameEventsBuffer.shift()));
        }
        return _results;
      }
    };

    Client.prototype.sendEvent = function(data) {
      return this._sendMessage(this.clientMessageFactory.event(data));
    };

    Client.prototype.disconnect = function() {
      return this.adapter.disconnect();
    };

    Client.prototype._unpackServerMessage = function(data) {
      return data;
    };

    Client.prototype._packClientMessage = function(msg) {
      return msg;
    };

    Client.prototype._packProtoTurn = function(events) {
      return events;
    };

    Client.prototype._unpackProtoTurn = function(protoTurn) {
      return protoTurn;
    };

    Client.prototype._sendMessage = function(msg) {
      return this.adapter.send(this._packClientMessage(msg));
    };

    return Client;

  })(EventEmitter);

}).call(this);
