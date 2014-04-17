(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Number.prototype.fixed = function(n) {
  n = n || 3;
  return parseFloat(this.toFixed(n));
};


},{}],2:[function(require,module,exports){
var CRC32_TABLE, ChecksumCalculator;

CRC32_TABLE = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

ChecksumCalculator = (function() {
  function ChecksumCalculator() {}

  ChecksumCalculator.prototype.calculate = function(str, crc) {
    var i, n, x, _i, _ref;
    if (crc == null) {
      crc = 0;
    }
    console.log(str);
    n = 0;
    x = 0;
    crc = crc ^ (-1);
    for (i = _i = 0, _ref = str.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      n = (crc ^ str.charCodeAt(i)) & 0xFF;
      x = "0x" + CRC32_TABLE.substr(n * 9, 8);
      crc = (crc >>> 8) ^ x;
    }
    return crc ^ (-1);
  };

  return ChecksumCalculator;

})();

module.exports = ChecksumCalculator;


},{}],3:[function(require,module,exports){
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
    this._debugOn = false;
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
        if (msg.type !== 'ServerMessage::TurnComplete') {
          _this._debug("rec'd ClientAdapter::Packet", msg);
        }
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
    if (msg.type !== 'ClientMsg::TurnFinished') {
      this._debug("_sendMessage", msg);
    }
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
var createSimulation, createSimulationUsingSocketIO, createSocketIOClientAdapter;

require('../helpers.coffee');

createSimulation = function(opts) {
  var ChecksumCalculator, Client, ClientMessageFactory, GameEventFactory, Simulation, SimulationEventFactory, SimulationStateFactory, SimulationStateSerializer, TurnCalculator, UserEventSerializer, checksumCalculator, client, clientMessageFactory, gameEventFactory, simulation, simulationEventFactory, simulationStateFactory, simulationStateSerializer, turnCalculator, userEventSerializer;
  if (opts == null) {
    opts = {};
  }
  if (!opts.adapter) {
    throw new error("Cannot build simulation without network adapter, such as SocketIOClientAdapter");
  }
  if (!opts.worldClass) {
    throw new Error("Cannot build simulation without worldClass, which must implement interface WorldBase");
  }
  GameEventFactory = require('./game_event_factory.coffee');
  ClientMessageFactory = require('./client_message_factory.coffee');
  SimulationEventFactory = require('./simulation_event_factory.coffee');
  Client = require('./client.coffee');
  TurnCalculator = require('./turn_calculator.coffee');
  SimulationStateFactory = require('./simulation_state_factory.coffee');
  SimulationStateSerializer = require('./simulation_state_serializer.coffee');
  UserEventSerializer = require('./user_event_serializer.coffee');
  Simulation = require('./simulation.coffee');
  ChecksumCalculator = require('./checksum_calculator.coffee');
  gameEventFactory = new GameEventFactory();
  clientMessageFactory = new ClientMessageFactory();
  simulationEventFactory = new SimulationEventFactory();
  client = new Client(opts.adapter, gameEventFactory, clientMessageFactory, simulationEventFactory);
  turnCalculator = new TurnCalculator();
  userEventSerializer = new UserEventSerializer();
  simulationStateFactory = new SimulationStateFactory({
    timePerTurn: opts.timesPerTurn || 0.1,
    stepsPerTurn: opts.stepsPerTurn || 6,
    step: opts.step || 0,
    worldClass: opts.worldClass
  });
  checksumCalculator = new ChecksumCalculator();
  simulationStateSerializer = new SimulationStateSerializer(simulationStateFactory, checksumCalculator);
  simulation = new Simulation(client, turnCalculator, simulationStateFactory, simulationStateSerializer, userEventSerializer);
  return simulation;
};

createSocketIOClientAdapter = function(socketIO) {
  var SocketIOClientAdapter;
  SocketIOClientAdapter = require('./socket_io_client_adapter.coffee');
  return new SocketIOClientAdapter(socketIO);
};

createSimulationUsingSocketIO = function(opts) {
  if (opts == null) {
    opts = {};
  }
  opts.adapter = createSocketIOClientAdapter(opts.socketIO);
  return createSimulation(opts);
};

exports.create = {
  socketIOSimulation: createSimulationUsingSocketIO
};


},{"../helpers.coffee":1,"./checksum_calculator.coffee":2,"./client.coffee":3,"./client_message_factory.coffee":4,"./game_event_factory.coffee":6,"./simulation.coffee":8,"./simulation_event_factory.coffee":9,"./simulation_state_factory.coffee":11,"./simulation_state_serializer.coffee":12,"./socket_io_client_adapter.coffee":13,"./turn_calculator.coffee":14,"./user_event_serializer.coffee":15}],8:[function(require,module,exports){
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
    this.lastTurnNumber = null;
    this._debugOn = false;
  }

  Simulation.prototype.worldState = function() {
    if (this.simState) {
      return this.simState.world;
    }
  };

  Simulation.prototype.clientId = function() {
    return this.client.clientId;
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

  Simulation.prototype.update = function(timeInSeconds) {
    var elapsedTurnTime;
    if (this.simState) {
      elapsedTurnTime = (timeInSeconds - this.lastTurnTime).fixed();
      this.turnCalculator.stepUntilTurnTime(this.simState, elapsedTurnTime);
    }
    return this.client.update((function(_this) {
      return function(gameEvent) {
        var checksum, packedSimState, simEvent, userEvent, _i, _len, _ref, _ref1;
        switch (gameEvent.type) {
          case 'GameEvent::TurnComplete':
            _this._debug("GameEvent::TurnComplete", new Date().getTime());
            _this.turnCalculator.advanceTurn(_this.simState);
            _this.lastTurnTime = timeInSeconds;
            if (_this.lastTurnNumber !== null && gameEvent.turnNumber !== (_this.lastTurnNumber + 1)) {
              console.log("Simulation: turn number should be " + (_this.lastTurnNumber + 1) + " BUT WAS " + gameEvent.turnNumber, gameEvent);
            }
            _this.lastTurnNumber = gameEvent.turnNumber;
            _ref = gameEvent.events;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              simEvent = _ref[_i];
              switch (simEvent.type) {
                case 'SimulationEvent::Event':
                  userEvent = _this.userEventSerializer.unpack(simEvent.data);
                  if (userEvent.type === 'UserEvent::WorldProxyEvent') {
                    if (_this.simState.world[userEvent.method]) {
                      (_ref1 = _this.simState.world)[userEvent.method].apply(_ref1, [simEvent.playerId].concat(__slice.call(userEvent.args)));
                    } else {
                      throw new Error("WorldProxyEvent with method " + userEvent.method + " CANNOT BE APPLIED because the world object doesn't have that method!");
                    }
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
            checksum = _this.simulationStateSerializer.calcWorldChecksum(_this.simState.world, _this.simState.checksum);
            _this.simState.checksum = checksum;
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


},{"../helpers.coffee":1}],9:[function(require,module,exports){
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


},{}],10:[function(require,module,exports){
var SimulationState;

require('../helpers.coffee');

SimulationState = (function() {
  function SimulationState(timePerTurn, stepsPerTurn, step, world) {
    this.timePerTurn = timePerTurn;
    this.stepsPerTurn = stepsPerTurn;
    this.step = step;
    this.world = world;
    this.timePerStep = (this.timePerTurn / this.stepsPerTurn).fixed();
    this.checksum = 0;
  }

  return SimulationState;

})();

module.exports = SimulationState;


},{"../helpers.coffee":1}],11:[function(require,module,exports){
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


},{"./simulation_state.coffee":10}],12:[function(require,module,exports){
var SimulationState, SimulationStateSerializer;

SimulationState = require('./simulation_state.coffee');

SimulationStateSerializer = (function() {
  function SimulationStateSerializer(simulationStateFactory, checksumCalculator) {
    this.simulationStateFactory = simulationStateFactory;
    this.checksumCalculator = checksumCalculator;
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

  SimulationStateSerializer.prototype.calcWorldChecksum = function(world, checksum) {
    return this.checksumCalculator.calculate(JSON.stringify(world.toAttributes()), checksum);
  };

  return SimulationStateSerializer;

})();

module.exports = SimulationStateSerializer;


},{"./simulation_state.coffee":10}],13:[function(require,module,exports){
var EventEmitter, SocketIOClientAdapter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('./event_emitter.coffee');

SocketIOClientAdapter = (function(_super) {
  __extends(SocketIOClientAdapter, _super);

  function SocketIOClientAdapter(socket) {
    this.socket = socket;
    if (!this.socket) {
      throw new Error("A socket.io socket instance is required to build SockedIOClientAdapter");
    }
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


},{"./event_emitter.coffee":5}],14:[function(require,module,exports){
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


},{"../helpers.coffee":1}],15:[function(require,module,exports){
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


},{}],16:[function(require,module,exports){
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

  return WorldBase;

})();

module.exports = WorldBase;


},{}],17:[function(require,module,exports){
var $GLOBAL, $SIMSIM, Tank, Tanks2World, WorldBase, create, createTank, destroyTank, preload, render, update, updateSimulation,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

$SIMSIM = require('./simult_sim/index.coffee');

WorldBase = require('./simult_sim/world_base.coffee');

Tanks2World = (function(_super) {
  __extends(Tanks2World, _super);

  function Tanks2World(atts) {
    if (atts == null) {
      atts = null;
    }
    this.data = atts || {
      nextId: 0,
      players: {},
      tanks: {}
    };
  }

  Tanks2World.prototype.playerJoined = function(id) {
    var tankId;
    tankId = "T" + this.data.nextId;
    this.data.nextId += 1;
    this.data.tanks[tankId] = {
      x: 200,
      y: 200,
      angle: 0,
      turretAngle: 0,
      speed: 0,
      controls: {
        left: false,
        right: false,
        forward: false,
        turretLeft: false,
        turretRight: false
      }
    };
    this.data.players[id] = {
      score: 0,
      tankId: tankId
    };
    return console.log("Player " + id + " JOINED, @data is now", this.data);
  };

  Tanks2World.prototype.playerLeft = function(id) {
    var tankId;
    if (tankId = this.data.players[id].tankId) {
      delete this.data.tanks[tankId];
    }
    delete this.data.players[id];
    return console.log("Player " + id + " LEFT, @data is now", this.data);
  };

  Tanks2World.prototype.step = function(dt) {
    var info, r, tankId, _ref, _results;
    _ref = this.data.tanks;
    _results = [];
    for (tankId in _ref) {
      info = _ref[tankId];
      if (info.controls.forward) {
        info.speed = 200;
      } else {
        if (info.speed > 0) {
          info.speed -= 8;
        }
      }
      if (info.controls.left) {
        info.angle -= 4;
      }
      if (info.controls.right) {
        info.angle += 4;
      }
      if (info.controls.turretLeft) {
        info.turretAngle -= 4;
      }
      if (info.controls.turretRight) {
        info.turretAngle += 4;
      }
      r = info.angle * Math.PI / 180.0;
      info.x += dt * info.speed * Math.cos(r);
      _results.push(info.y += dt * info.speed * Math.sin(r));
    }
    return _results;
  };

  Tanks2World.prototype.toAttributes = function() {
    return this.data;
  };

  Tanks2World.prototype.moveForward = function(id, active) {
    var tank;
    if (tank = this._playerTank(id)) {
      return tank.controls.forward = active;
    }
  };

  Tanks2World.prototype.turnLeft = function(id, active) {
    var tank;
    if (tank = this._playerTank(id)) {
      return tank.controls.left = active;
    }
  };

  Tanks2World.prototype.turnRight = function(id, active) {
    var tank;
    if (tank = this._playerTank(id)) {
      return tank.controls.right = active;
    }
  };

  Tanks2World.prototype.spinTurretRight = function(id, active) {
    var tank;
    if (tank = this._playerTank(id)) {
      return tank.controls.turretRight = active;
    }
  };

  Tanks2World.prototype.spinTurretLeft = function(id, active) {
    var tank;
    if (tank = this._playerTank(id)) {
      return tank.controls.turretLeft = active;
    }
  };

  Tanks2World.prototype.setLoc = function(id, x, y) {
    var tank;
    if (tank = this._playerTank(id)) {
      tank.x = x;
      return tank.y = y;
    }
  };

  Tanks2World.prototype._playerTank = function(id) {
    return this.data.tanks[this.data.players[id].tankId];
  };

  return Tanks2World;

})(WorldBase);

$GLOBAL = {};

$GLOBAL.land = null;

$GLOBAL.cursors = null;

$GLOBAL.game = null;

$GLOBAL.clutch = {
  tanks: {}
};

preload = function() {
  $GLOBAL.game.load.atlas('tank', 'tanks_assets/tanks.png', 'tanks_assets/tanks.json');
  $GLOBAL.game.load.atlas('enemy', 'tanks_assets/enemy-tanks.png', 'tanks_assets/tanks.json');
  $GLOBAL.game.load.image('logo', 'tanks_assets/logo.png');
  $GLOBAL.game.load.image('bullet', 'tanks_assets/bullet.png');
  $GLOBAL.game.load.image('earth', 'tanks_assets/scorched_earth.png');
  return $GLOBAL.game.load.spritesheet('kaboom', 'tanks_assets/explosion.png', 64, 64, 23);
};

create = function() {
  var url;
  url = "http://" + location.hostname + ":" + location.port;
  $GLOBAL.simulation = $SIMSIM.create.socketIOSimulation({
    socketIO: io.connect(url),
    worldClass: Tanks2World
  });
  $GLOBAL.beginTime = new Date().getTime();
  $GLOBAL.game.world.setBounds(-1000, -1000, 2000, 2000);
  $GLOBAL.land = $GLOBAL.game.add.tileSprite(0, 0, 800, 600, 'earth');
  $GLOBAL.land.fixedToCamera = true;
  $GLOBAL.cursors = $GLOBAL.game.input.keyboard.createCursorKeys();
  $GLOBAL.cursors.turretLeft = $GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.A);
  $GLOBAL.cursors.turretRight = $GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.D);
  $GLOBAL.localControls = {
    up: false,
    left: false,
    right: false,
    down: false,
    turretLeft: false,
    turretRight: false
  };
  return setInterval(updateSimulation, 1000 / 30);
};

Tank = (function() {
  function Tank(game, info) {
    this.game = game;
    this.chassis = this.game.add.sprite(info.x, info.y, 'tank', 'tank1');
    this.chassis.anchor.setTo(0.5, 0.5);
    this.chassis.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);
    this.turret = game.add.sprite(info.x, info.y, 'tank', 'turret');
    this.turret.anchor.setTo(0.3, 0.5);
    this.shadow = this.game.add.sprite(0, 0, 'tank', 'shadow');
    this.shadow.anchor.setTo(0.5, 0.5);
    this.chassis.bringToTop();
    this.turret.bringToTop();
  }

  Tank.prototype.kill = function() {
    this.chassis.kill();
    this.shadow.kill();
    return this.turret.kill();
  };

  return Tank;

})();

createTank = function(game, info) {
  var tank;
  tank = new Tank(game, info);
  return tank;
};

destroyTank = function(game, tank) {
  return tank.kill();
};

updateSimulation = function() {
  var elapsedSeconds, now;
  now = new Date().getTime();
  elapsedSeconds = (now - $GLOBAL.beginTime) / 1000.0;
  return $GLOBAL.simulation.update(elapsedSeconds);
};

update = function() {
  var controls, cursors, left, me, right, tank, tankId, tankInfo, tanks, turretLeft, turretRight, up, world, _ref;
  if (world = $GLOBAL.simulation.worldState()) {
    tanks = $GLOBAL.clutch.tanks;
    _ref = world.data.tanks;
    for (tankId in _ref) {
      tankInfo = _ref[tankId];
      tank = tanks[tankId];
      if (!tank) {
        tank = createTank($GLOBAL.game, tankInfo);
        tanks[tankId] = tank;
        me = $GLOBAL.simulation.clientId();
        console.log("Created tank " + tankId + ".  My id is " + me + " and I own tank " + world.data.players[me].tankId);
        if (world.data.players[me].tankId === tankId) {
          console.log("THIS IS MY TANK LET'S CAMERA FOLLOW");
          $GLOBAL.game.camera.follow(tank.chassis);
          $GLOBAL.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
        }
      }
      tank.chassis.angle = tankInfo.angle;
      tank.chassis.x = tankInfo.x;
      tank.chassis.y = tankInfo.y;
      tank.shadow.angle = tankInfo.angle;
      tank.shadow.x = tankInfo.x;
      tank.shadow.y = tankInfo.y;
      tank.turret.x = tankInfo.x;
      tank.turret.y = tankInfo.y;
      tank.turret.angle = tankInfo.angle + tankInfo.turretAngle;
    }
    for (tankId in tanks) {
      tank = tanks[tankId];
      if (!world.data.tanks[tankId]) {
        destroyTank($GLOBAL.game, tank);
      }
    }
  }
  controls = $GLOBAL.localControls;
  cursors = $GLOBAL.cursors;
  up = cursors.up.isDown;
  if (up && !controls.up) {
    $GLOBAL.simulation.worldProxy('moveForward', true);
  }
  if (!up && controls.up) {
    $GLOBAL.simulation.worldProxy('moveForward', false);
  }
  controls.up = up;
  left = cursors.left.isDown;
  if (left && !controls.left) {
    $GLOBAL.simulation.worldProxy('turnLeft', true);
  }
  if (!left && controls.left) {
    $GLOBAL.simulation.worldProxy('turnLeft', false);
  }
  controls.left = left;
  right = cursors.right.isDown;
  if (right && !controls.right) {
    $GLOBAL.simulation.worldProxy('turnRight', true);
  }
  if (!right && controls.right) {
    $GLOBAL.simulation.worldProxy('turnRight', false);
  }
  controls.right = right;
  turretRight = cursors.turretRight.isDown;
  if (turretRight && !controls.turretRight) {
    $GLOBAL.simulation.worldProxy('spinTurretRight', true);
  }
  if (!turretRight && controls.turretRight) {
    $GLOBAL.simulation.worldProxy('spinTurretRight', false);
  }
  controls.turretRight = turretRight;
  turretLeft = cursors.turretLeft.isDown;
  if (turretLeft && !controls.turretLeft) {
    $GLOBAL.simulation.worldProxy('spinTurretLeft', true);
  }
  if (!turretLeft && controls.turretLeft) {
    $GLOBAL.simulation.worldProxy('spinTurretLeft', false);
  }
  controls.turretLeft = turretLeft;
  $GLOBAL.land.tilePosition.x = -$GLOBAL.game.camera.x;
  return $GLOBAL.land.tilePosition.y = -$GLOBAL.game.camera.y;
};

render = function() {};

$GLOBAL.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});

window.$GLOBAL = $GLOBAL;


},{"./simult_sim/index.coffee":7,"./simult_sim/world_base.coffee":16}]},{},[17])