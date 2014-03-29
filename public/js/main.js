(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Number.prototype.fixed = function(n) {
  n = n || 3;
  return parseFloat(this.toFixed(n));
};


},{}],2:[function(require,module,exports){
var Client, ClientMessageFactory, GameEventFactory, Simulation, SimulationEventFactory, SimulationStateFactory, SimulationStateSerializer, SocketIOClientAdapter, TurnCalculator, UserEventSerializer, WorldBase,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

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

window.startSimulation = function() {
  var MyWorld, adapter, beginTime, client, clientMessageFactory, gameEventFactory, period, simulation, simulationEventFactory, simulationStateFactory, simulationStateSerializer, socket, turnCalculator, userEventSerializer, webTimer;
  socket = io.connect(location.toString());
  adapter = new SocketIOClientAdapter(socket);
  gameEventFactory = new GameEventFactory();
  clientMessageFactory = new ClientMessageFactory();
  simulationEventFactory = new SimulationEventFactory();
  client = new Client(adapter, gameEventFactory, clientMessageFactory, simulationEventFactory);
  turnCalculator = new TurnCalculator();
  userEventSerializer = new UserEventSerializer();
  MyWorld = (function(_super) {
    __extends(MyWorld, _super);

    function MyWorld() {
      this._debugOn = true;
      this.players = {};
    }

    MyWorld.fromAttributes = function(data) {
      var w;
      w = new MyWorld();
      return w.players = data.players;
    };

    MyWorld.prototype.playerJoined = function(id) {
      this.players[id] = {
        score: 0
      };
      return this._debug("Player " + id + " JOINED");
    };

    MyWorld.prototype.playerLeft = function(id) {
      delete this.players[id];
      return this._debug("Player " + id + " LEFT");
    };

    MyWorld.prototype.step = function(dt) {};

    MyWorld.prototype.addScore = function(id, score) {
      this.players[id].score += score;
      return this._debug("UPDATED player " + id + " score to " + this.players[id].score);
    };

    MyWorld.prototype.toAttributes = function() {
      return {
        players: this.players
      };
    };

    MyWorld.prototype._debug = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this._debugOn) {
        return console.log.apply(console, ["[MyWorld]"].concat(__slice.call(args)));
      }
    };

    return MyWorld;

  })(WorldBase);
  simulationStateFactory = new SimulationStateFactory({
    timePerTurn: 1.0,
    stepsPerTurn: 6,
    step: 0,
    worldClass: MyWorld
  });
  simulationStateSerializer = new SimulationStateSerializer(simulationStateFactory);
  simulation = new Simulation(client, turnCalculator, simulationStateFactory, simulationStateSerializer, userEventSerializer);
  window.simulation = simulation;
  window.scoreButtonClicked = function() {
    return console.log(simulation.worldProxy('addScore', 1));
  };
  period = 250;
  beginTime = new Date().getTime();
  return webTimer = setInterval((function() {
    var elapsedSeconds, id, now, player, sb, str, _ref;
    now = new Date().getTime();
    elapsedSeconds = (now - beginTime) / 1000.0;
    simulation.update(elapsedSeconds);
    sb = window.document.getElementById('score-board');
    if (sb) {
      str = '';
      _ref = simulation.worldState().players;
      for (id in _ref) {
        player = _ref[id];
        str += "Player " + id + " score: " + player.score + "\n";
      }
      str += "Time: " + (new Date().getTime()) + "\n";
      return sb.textContent = str;
    }
  }), period);
};


},{"./simult_sim/client.coffee":3,"./simult_sim/client_message_factory.coffee":4,"./simult_sim/game_event_factory.coffee":6,"./simult_sim/simulation.coffee":7,"./simult_sim/simulation_event_factory.coffee":8,"./simult_sim/simulation_state_factory.coffee":10,"./simult_sim/simulation_state_serializer.coffee":11,"./simult_sim/socket_io_client_adapter.coffee":12,"./simult_sim/turn_calculator.coffee":13,"./simult_sim/user_event_serializer.coffee":14,"./simult_sim/world_base.coffee":15}],3:[function(require,module,exports){
var Client, EventEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

EventEmitter = require('./event_emitter.coffee');

Client = (function(_super) {
  __extends(Client, _super);

  function Client(adapter, gameEventFactory, clientMessageFactory, simulationEventFactory) {
    this.adapter = adapter;
    this.gameEventFactory = gameEventFactory;
    this.clientMessageFactory = clientMessageFactory;
    this.simulationEventFactory = simulationEventFactory;
    this._debugOn = true;
    this.gameStarted = false;
    this.clientId = null;
    this.simulationEventsBuffer = [];
    this.gameEventsBuffer = [];
    this.preGameEventsBuffer = [];
    this.adapter.on('ClientAdapter::Disconnected', (function(_this) {
      return function() {
        _this._debug("rec'd ClientAdapter::Disconnected");
        return _this.gameEventsBuffer.push(_this.gameEventFactory.disconnected());
      };
    })(this));
    this.adapter.on('ClientAdapter::Packet', (function(_this) {
      return function(data) {
        var copyOfSimEvents, f, gameEvent, msg, protoTurn, simEvent, _i, _len, _ref;
        msg = _this._unpackServerMessage(data);
        _this._debug("rec'd ClientAdapter::Packet", msg);
        switch (msg.type) {
          case 'ServerMessage::IdAssigned':
            return _this.clientId = msg.ourId;
          case 'ServerMessage::Event':
            return _this.simulationEventsBuffer.push(_this.simulationEventFactory.event(msg.sourcePlayerId, msg.data));
          case 'ServerMessage::PlayerJoined':
            return _this.simulationEventsBuffer.push(_this.simulationEventFactory.playerJoined(msg.playerId));
          case 'ServerMessage::PlayerLeft':
            return _this.simulationEventsBuffer.push(_this.simulationEventFactory.playerLeft(msg.playerId));
          case 'ServerMessage::TurnComplete':
            return _this._turnComplete(msg);
          case 'ServerMessage::StartGame':
            _this._debug('ServerMessage::StartGame', msg);
            _this.gameStarted = true;
            _ref = _this._unpackProtoTurn(msg.protoTurn);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              simEvent = _ref[_i];
              _this.simulationEventsBuffer.push(simEvent);
            }
            return _this.preGameEventsBuffer.push(_this.gameEventFactory.startGame(msg.yourId, msg.turnPeriod, msg.currentTurn, msg.gamestate));
          case 'ServerMessage::GamestateRequest':
            copyOfSimEvents = _this.simulationEventsBuffer.slice(0);
            protoTurn = _this._packProtoTurn(copyOfSimEvents);
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

  Client.prototype._turnComplete = function(msg) {
    var f, i, turnEvents, _i, _ref;
    turnEvents = [];
    for (i = _i = 0, _ref = this.simulationEventsBuffer.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      turnEvents.push(this.simulationEventsBuffer.shift());
    }
    f = (function(_this) {
      return function(checksum) {
        return _this._sendMessage(_this.clientMessageFactory.turnFinished(msg.turnNumber, checksum));
      };
    })(this);
    return this.gameEventsBuffer.push(this.gameEventFactory.turnComplete(msg.turnNumber, turnEvents, f));
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
    this._debug("_sendMessage", msg);
    return this.adapter.send(this._packClientMessage(msg));
  };

  Client.prototype._debug = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this._debugOn) {
      return console.log.apply(console, ["[Client]"].concat(__slice.call(args)));
    }
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
      data: gamestate
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
    this._debugOn = true;
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
    this._debug("sendEvent", event);
    return this.client.sendEvent(this.userEventSerializer.pack(event));
  };

  Simulation.prototype.update = function(seconds) {
    var elapsedTurnTime;
    if (this.simState) {
      elapsedTurnTime = (seconds - this.lastTurnTime).fixed();
      this.turnCalculator.stepUntilTurnTime(this.simState, elapsedTurnTime);
    }
    return this.client.update((function(_this) {
      return function(gameEvent) {
        var checksum, packedSimState, simEvent, userEvent, _i, _len, _ref, _ref1;
        switch (gameEvent.type) {
          case 'GameEvent::TurnComplete':
            _this._debug("GameEvent::TurnComplete.... simState is", _this.simState);
            _this.turnCalculator.advanceTurn(_this.simState);
            _this.lastTurnTime = seconds;
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
            _this.simState = _this.simulationStateSerializer.unpackSimulationState(gameEvent.gamestate);
            return _this._debug("GameEvent::StartGame.... gameEvent is", gameEvent, "simState is", _this.simState);
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

  Simulation.prototype._debug = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this._debugOn) {
      return console.log("[Simulation]", args);
    }
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

require('../helpers.coffee');

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


},{"../helpers.coffee":1}],10:[function(require,module,exports){
var SimulationState, SimulationStateFactory;

SimulationState = require('./simulation_state.coffee');

SimulationStateFactory = (function() {
  function SimulationStateFactory(defaults) {
    this.defaults = defaults;
  }

  SimulationStateFactory.prototype.createSimulationState = function() {
    return new SimulationState(this.defaults.timePerTurn, this.defaults.stepsPerTurn, 0, this.createWorld(this.defaults.worldData || null));
  };

  SimulationStateFactory.prototype.createWorld = function(atts) {
    if (this.defaults.worldClass) {
      return new this.defaults.worldClass(atts);
    } else {
      throw new Error("SimulationStateFactory needs a worldClass");
    }
  };

  return SimulationStateFactory;

})();

module.exports = SimulationStateFactory;


},{"./simulation_state.coffee":9}],11:[function(require,module,exports){
var SimulationState, SimulationStateSerializer;

SimulationState = require('./simulation_state.coffee');

SimulationStateSerializer = (function() {
  function SimulationStateSerializer(simulationStateFactory) {
    this.simulationStateFactory = simulationStateFactory;
  }

  SimulationStateSerializer.prototype.packSimulationState = function(simState) {
    return {
      timePerTurn: simState.timePerTurn,
      stepsPerTurn: simState.stepsPerTurn,
      step: simState.step,
      world: simState.world.toAttributes()
    };
  };

  SimulationStateSerializer.prototype.unpackSimulationState = function(data) {
    return new SimulationState(data.timePerTurn, data.stepsPerTurn, data.step, this.simulationStateFactory.createWorld(data.world));
  };

  SimulationStateSerializer.prototype.calcWorldChecksum = function(world) {
    return "temporary world checksum";
  };

  return SimulationStateSerializer;

})();

module.exports = SimulationStateSerializer;


},{"./simulation_state.coffee":9}],12:[function(require,module,exports){
var EventEmitter, SocketIOClientAdapter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

EventEmitter = require('./event_emitter.coffee');

SocketIOClientAdapter = (function(_super) {
  __extends(SocketIOClientAdapter, _super);

  function SocketIOClientAdapter(socket) {
    this.socket = socket;
    this.socket.on('data', (function(_this) {
      return function(data) {
        _this._debug("rec'd data: ", data);
        return _this.emit('ClientAdapter::Packet', data);
      };
    })(this));
    this.socket.on('disconnect', (function(_this) {
      return function() {
        _this._debug("rec'd disconnect");
        return _this.emit('ClientAdapter::Disconnected');
      };
    })(this));
  }

  SocketIOClientAdapter.prototype.send = function(data) {
    this._debug("send", data);
    return this.socket.emit('data', data);
  };

  SocketIOClientAdapter.prototype.disconnect = function() {
    return this.socket.disconnect();
  };

  SocketIOClientAdapter.prototype._debug = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (this._debugOn) {
      return console.log.apply(console, ["[SocketIOClientAdapter]"].concat(__slice.call(args)));
    }
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

  WorldBase.prototype.toAttributes = function() {
    throw new Error("Please implement WorldBase#toAttributes");
  };

  WorldBase.fromAttributes = function() {
    throw new Error("Please implement WorldBase.fromAttributes");
  };

  return WorldBase;

})();

module.exports = WorldBase;


},{}]},{},[2])