(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Number.prototype.fixed = function(n) {
  n = n || 3;
  return parseFloat(this.toFixed(n));
};


},{}],2:[function(require,module,exports){
var Client, ClientMessageFactory, GameEventFactory, MyWorld, Simulation, SimulationEventFactory, SimulationStateFactory, SimulationStateSerializer, SocketIOClientAdapter, TurnCalculator, UserEventSerializer, WorldBase, adapter, client, clientMessageFactory, gameEventFactory, simulation, simulationEventFactory, simulationStateFactory, simulationStateSerializer, socket, turnCalculator, userEventSerializer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SocketIOClientAdapter = require('./simult_sim/socket_io_client_adapter.coffee');

GameEventFactory = require('./simult_sim/game_event_factory.coffee');

ClientMessageFactory = require('./simult_sim/client_message_factory.coffee');

SimulationEventFactory = require('./simult_sim/simulation_event_factory.coffee');

Client = require('./simult_sim/client.coffee');

TurnCalculator = require('./simult_sim/turn_calculator.coffee');

SimulationStateFactory = require('./simult_sim/simulation_state_factory.coffee');

SimulationStateSerializer = require('./simult_sim/simulation_state_serializer.coffee');

UserEventSerializer = require('./simult_sim/user_event_serializer.coffee');

Simulation = require('./simult_sim/simulation.coffee');

WorldBase = require('./simult_sim/world_base.coffee');

socket = io.connect(location.toString());

adapter = new SocketIOClientAdapter(socket);

gameEventFactory = new GameEventFactory();

clientMessageFactory = new ClientMessageFactory();

simulationEventFactory = new SimulationEventFactory();

client = new Client(adapter, gameEventFactory, clientMessageFactory, simulationEventFactory);

turnCalculator = new TurnCalculator();

simulationStateSerializer = new SimulationStateSerializer();

userEventSerializer = new UserEventSerializer();

MyWorld = (function(_super) {
  __extends(MyWorld, _super);

  function MyWorld() {
    this.players = {};
  }

  MyWorld.prototype.playerJoined = function(id) {
    return this.players[id] = {
      score: 0
    };
  };

  MyWorld.prototype.playerLeft = function(id) {
    return delete this.players[id];
  };

  MyWorld.prototype.step = function(dt) {};

  MyWorld.prototype.addScore = function(id, score) {
    return this.players[id].score += score;
  };

  return MyWorld;

})(WorldBase);

simulationStateFactory = new SimulationStateFactory({
  timePerTurn: 0.1,
  stepsPerTurn: 6,
  step: 0,
  createWorld: function() {
    return new MyWorld();
  }
});

simulation = new Simulation(client, turnCalculator, simulationStateFactory, simulationStateSerializer, userEventSerializer);

window.simulation = simulation;

console.log(window.simulation);

console.log("Main done.");


},{"./simult_sim/client.coffee":3,"./simult_sim/client_message_factory.coffee":4,"./simult_sim/game_event_factory.coffee":6,"./simult_sim/simulation.coffee":7,"./simult_sim/simulation_event_factory.coffee":8,"./simult_sim/simulation_state_factory.coffee":10,"./simult_sim/simulation_state_serializer.coffee":11,"./simult_sim/socket_io_client_adapter.coffee":12,"./simult_sim/turn_calculator.coffee":13,"./simult_sim/user_event_serializer.coffee":14,"./simult_sim/world_base.coffee":15}],3:[function(require,module,exports){
var Client, EventEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('./event_emitter.coffee');

Client = (function(_super) {
  __extends(Client, _super);

  function Client(adapter, gameEventFactory, clientMessageFactory, simulationEventFactory) {
    this.adapter = adapter;
    this.gameEventFactory = gameEventFactory;
    this.clientMessageFactory = clientMessageFactory;
    this.simulationEventFactory = simulationEventFactory;
    this.gameStarted = false;
    this.clientId = null;
    this.simulationEventsBuffer = [];
    this.gameEventsBuffer = [];
    this.preGameEventsBuffer = [];
    this.adapter.on('ClientAdapter::Disconnected', (function(_this) {
      return function() {
        return _this.gameEventsBuffer.push(_this.gameEventFactory.disconnected());
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
            for (i = _i = 0, _ref = _this.simulationEventsBuffer.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              turnEvents.push(_this.simulationEventsBuffer.shift());
            }
            f = function(checksum) {
              return _this._sendMessage(_this.clientMessageFactory.turnFinished(msg.turnNumber, checksum));
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
              return _this._sendMessage(_this.clientMessageFactory.gamestate(msg.forPlayerId, protoTurn, gamestate));
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
    var event, i, _i, _j, _ref, _ref1, _results;
    for (i = _i = 0, _ref = this.preGameEventsBuffer.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      callback(this.preGameEventsBuffer.shift());
    }
    if (this.gameStarted) {
      _results = [];
      for (i = _j = 0, _ref1 = this.gameEventsBuffer.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        event = this.gameEventsBuffer.shift();
        _results.push(callback(event));
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

module.exports = Client;


},{"./event_emitter.coffee":5}],4:[function(require,module,exports){
var ClientMessageFactory;

ClientMessageFactory = (function() {
  function ClientMessageFactory() {}

  ClientMessageFactory.prototype.turnFinished = function(turnNumber, checksum) {
    return {
      type: 'ClientMsg::TurnFinished',
      turnNumber: turnNumber,
      checksum: checksum
    };
  };

  ClientMessageFactory.prototype.gamestate = function(forPlayerId, protoTurn, gamestate) {
    return {
      type: 'ClientMsg::Gamestate',
      forPlayerId: forPlayerId,
      protoTurn: protoTurn,
      gamestate: gamestate
    };
  };

  ClientMessageFactory.prototype.event = function(data) {
    return {
      type: 'ClientMsg::Event',
      data: data
    };
  };

  return ClientMessageFactory;

})();

module.exports = ClientMessageFactory;


},{}],5:[function(require,module,exports){
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

module.exports = EventEmitter;


},{}],6:[function(require,module,exports){
var GameEventFactory;

GameEventFactory = (function() {
  function GameEventFactory() {}

  GameEventFactory.prototype.disconnected = function() {
    return {
      type: 'GameEvent::Disconnected'
    };
  };

  GameEventFactory.prototype.gamestateRequest = function(f) {
    return {
      type: 'GameEvent::GamestateRequest',
      gamestateClosure: f
    };
  };

  GameEventFactory.prototype.startGame = function(ourId, turnPeriod, currentTurn, gamestate) {
    return {
      type: 'GameEvent::StartGame',
      ourId: ourId,
      turnPeriod: turnPeriod,
      currentTurn: currentTurn,
      gamestate: gamestate
    };
  };

  GameEventFactory.prototype.turnComplete = function(turnNumber, events, checksumClosure) {
    return {
      type: 'GameEvent::TurnComplete',
      turnNumber: turnNumber,
      events: events,
      checksumClosure: checksumClosure
    };
  };

  return GameEventFactory;

})();

module.exports = GameEventFactory;


},{}],7:[function(require,module,exports){
var Simulation,
  __slice = [].slice;

require('../helpers.coffee');

Simulation = (function() {
  function Simulation(client, turnCalculator, simulationStateFactory, simulationStateSerializer, userEventSerializer) {
    this.client = client;
    this.turnCalculator = turnCalculator;
    this.simulationStateFactory = simulationStateFactory;
    this.simulationStateSerializer = simulationStateSerializer;
    this.userEventSerializer = userEventSerializer;
    this.lastTurnTime = 0;
  }

  Simulation.prototype.worldState = function() {
    if (this.simState) {
      return this.simState.world;
    }
  };

  Simulation.prototype.quit = function() {
    this.client.disconnect();
    return this.simState = null;
  };

  Simulation.prototype.worldProxy = function() {
    var args, method;
    method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return this.sendEvent({
      type: 'UserEvent::WorldProxyEvent',
      method: method,
      args: args
    });
  };

  Simulation.prototype.sendEvent = function(event) {
    return this.client.sendEvent(this.userEventSerializer.pack(event));
  };

  Simulation.prototype.update = function(t) {
    var elapsedTurnTime;
    if (this.simState) {
      elapsedTurnTime = (t - this.lastTurnTime).fixed();
      this.turnCalculator.stepUntilTurnTime(this.simState, elapsedTurnTime);
    }
    return this.client.update((function(_this) {
      return function(gameEvent) {
        var checksum, packedSimState, simEvent, userEvent, _i, _len, _ref, _ref1;
        switch (gameEvent.type) {
          case 'GameEvent::TurnComplete':
            _this.turnCalculator.advanceTurn(_this.simState);
            _this.lastTurnTime = t;
            _ref = gameEvent.events;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              simEvent = _ref[_i];
              switch (simEvent.type) {
                case 'SimulationEvent::Event':
                  userEvent = _this.userEventSerializer.unpack(simEvent.data);
                  if (userEvent.type === 'UserEvent::WorldProxyEvent') {
                    (_ref1 = _this.simState.world)[userEvent.method].apply(_ref1, [simEvent.playerId].concat(__slice.call(userEvent.args)));
                  } else {
                    _this.simState.world.incomingEvent(simEvent.playerId, userEvent);
                  }
                  break;
                case 'SimulationEvent::PlayerJoined':
                  _this.simState.world.playerJoined(simEvent.playerId);
                  break;
                case 'SimulationEvent::PlayerLeft':
                  _this.simState.world.playerLeft(simEvent.playerId);
              }
            }
            checksum = _this.simulationStateSerializer.calcWorldChecksum(_this.simState.world);
            return gameEvent.checksumClosure(checksum);
          case 'GameEvent::StartGame':
            _this.ourId = gameEvent.ourId;
            return _this.simState = _this.simulationStateSerializer.unpackSimulationState(gameEvent.gamestate);
          case 'GameEvent::GamestateRequest':
            _this.simState || (_this.simState = _this.simulationStateFactory.createSimulationState());
            packedSimState = _this.simulationStateSerializer.packSimulationState(_this.simState);
            return gameEvent.gamestateClosure(packedSimState);
          case 'GameEvent::Disconnected':
            return _this.simState = null;
        }
      };
    })(this));
  };

  return Simulation;

})();

module.exports = Simulation;


},{"../helpers.coffee":1}],8:[function(require,module,exports){
var SimulationEventFactory;

SimulationEventFactory = (function() {
  function SimulationEventFactory() {}

  SimulationEventFactory.prototype.event = function(playerId, data) {
    return {
      type: 'SimulationEvent::Event',
      playerId: playerId,
      data: data
    };
  };

  SimulationEventFactory.prototype.playerJoined = function(playerId) {
    return {
      type: 'SimulationEvent::PlayerJoined',
      playerId: playerId
    };
  };

  SimulationEventFactory.prototype.playerLeft = function(playerId) {
    return {
      type: 'SimulationEvent::PlayerLeft',
      playerId: playerId
    };
  };

  return SimulationEventFactory;

})();

module.exports = SimulationEventFactory;


},{}],9:[function(require,module,exports){
var SimulationState;

SimulationState = (function() {
  function SimulationState(timePerTurn, stepsPerTurn, step, world) {
    this.timePerTurn = timePerTurn;
    this.stepsPerTurn = stepsPerTurn;
    this.step = step;
    this.world = world;
    this.timePerStep = (this.timePerTurn / this.stepsPerTurn).fixed();
  }

  return SimulationState;

})();

module.exports = SimulationState;


},{}],10:[function(require,module,exports){
var SimulationState, SimulationStateFactory;

SimulationState = require('./simulation_state.coffee');

SimulationStateFactory = (function() {
  function SimulationStateFactory(defaults) {
    this.defaults = defaults;
  }

  SimulationStateFactory.prototype.createSimulationState = function() {
    return new SimulationState(this.defaults.timePerTurn, this.defaults.stepsPerTurn, 0, this._defaultWorld());
  };

  SimulationStateFactory.prototype._defaultWorld = function() {
    var world;
    world = null;
    if (this.defaults.world) {
      world = this.defaults.world;
    } else if (this.defaults.createWorld) {
      world = this.defaults.createWorld();
    }
    return world;
  };

  return SimulationStateFactory;

})();

module.exports = SimulationStateFactory;


},{"./simulation_state.coffee":9}],11:[function(require,module,exports){
var SimulationStateSerializer;

SimulationStateSerializer = (function() {
  function SimulationStateSerializer() {}

  SimulationStateSerializer.prototype.packSimulationState = function(simState) {
    return simState;
  };

  SimulationStateSerializer.prototype.unpackSimulationState = function(data) {
    return data;
  };

  SimulationStateSerializer.prototype.calcWorldChecksum = function(world) {
    return "temporary world checksum";
  };

  return SimulationStateSerializer;

})();

module.exports = SimulationStateSerializer;


},{}],12:[function(require,module,exports){
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
        return _this.emit('ClientAdapter::Disconnected');
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


},{"./event_emitter.coffee":5}],13:[function(require,module,exports){
var TurnCalculator;

require('../helpers.coffee');

TurnCalculator = (function() {
  function TurnCalculator() {}

  TurnCalculator.prototype.advanceTurn = function(simState) {
    this.stepUntil(simState, simState.stepsPerTurn);
    return simState.step = 0;
  };

  TurnCalculator.prototype.stepUntilTurnTime = function(simState, turnTime) {
    var shouldBeStep;
    shouldBeStep = Math.round(turnTime / simState.timePerStep);
    return this.stepUntil(simState, shouldBeStep);
  };

  TurnCalculator.prototype.stepUntil = function(simState, n) {
    var limit, _results;
    limit = simState.stepsPerTurn;
    if (n < limit) {
      limit = n;
    }
    _results = [];
    while (simState.step < limit) {
      simState.step += 1;
      _results.push(simState.world.step(simState.timePerStep));
    }
    return _results;
  };

  return TurnCalculator;

})();

module.exports = TurnCalculator;


},{"../helpers.coffee":1}],14:[function(require,module,exports){
var UserEventSerializer;

UserEventSerializer = (function() {
  function UserEventSerializer() {}

  UserEventSerializer.prototype.pack = function(msg) {
    return msg;
  };

  UserEventSerializer.prototype.unpack = function(data) {
    return data;
  };

  return UserEventSerializer;

})();

module.exports = UserEventSerializer;


},{}],15:[function(require,module,exports){
var WorldBase;

WorldBase = (function() {
  function WorldBase() {}

  WorldBase.prototype.playerJoined = function(id) {
    throw new Error("Please implement WorldBase#playerJoined");
  };

  WorldBase.prototype.playerLeft = function(id) {
    throw new Error("Please implement WorldBase#playerLeft");
  };

  WorldBase.prototype.incomingEvent = function(id) {
    throw new Error("Please implement WorldBase#incomingEvent");
  };

  WorldBase.prototype.step = function(dt) {
    throw new Error("Please implement WorldBase#step");
  };

  return WorldBase;

})();

module.exports = WorldBase;


},{}]},{},[2])