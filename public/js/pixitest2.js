(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
Number.prototype.fixed = function(n) {
  n = n || 3;
  return parseFloat(this.toFixed(n));
};


},{}],2:[function(require,module,exports){
var InputState, KeyboardController, KeyboardWrapper;

KeyboardWrapper = (function() {
  function KeyboardWrapper(keys) {
    var key, _i, _len, _ref;
    this.keys = keys;
    this.downs = {};
    _ref = this.keys;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      this.downs[key] = false;
      this._bind(key);
    }
  }

  KeyboardWrapper.prototype._bind = function(key) {
    Mousetrap.bind(key, ((function(_this) {
      return function() {
        return _this._keyDown(key);
      };
    })(this)), 'keydown');
    return Mousetrap.bind(key, ((function(_this) {
      return function() {
        return _this._keyUp(key);
      };
    })(this)), 'keyup');
  };

  KeyboardWrapper.prototype._keyDown = function(key) {
    this.downs[key] = true;
    return false;
  };

  KeyboardWrapper.prototype._keyUp = function(key) {
    this.downs[key] = false;
    return false;
  };

  KeyboardWrapper.prototype.isActive = function(key) {
    return this.downs[key];
  };

  return KeyboardWrapper;

})();

InputState = (function() {
  function InputState(key) {
    this.key = key;
    this.active = false;
  }

  InputState.prototype.update = function(keyboardWrapper) {
    var newState, oldState;
    oldState = this.active;
    newState = keyboardWrapper.isActive(this.key);
    this.active = newState;
    if (!oldState && newState) {
      return "justPressed";
    }
    if (oldState && !newState) {
      return "justReleased";
    } else {
      return null;
    }
  };

  return InputState;

})();

KeyboardController = (function() {
  function KeyboardController(bindings) {
    var action, key, _ref;
    this.bindings = bindings;
    this.keys = [];
    this.inputStates = {};
    this.actionStates = {};
    _ref = this.bindings;
    for (key in _ref) {
      action = _ref[key];
      this.keys.push(key);
      this.inputStates[key] = new InputState(key);
      this.actionStates[key] = false;
    }
    this.keyboardWrapper = new KeyboardWrapper(this.keys);
  }

  KeyboardController.prototype.update = function() {
    var action, diff, inputState, key, res, _ref;
    diff = {};
    _ref = this.inputStates;
    for (key in _ref) {
      inputState = _ref[key];
      action = this.bindings[key];
      res = inputState.update(this.keyboardWrapper);
      switch (res) {
        case "justPressed":
          diff[action] = true;
          this.actionStates[action] = true;
          break;
        case "justReleased":
          diff[action] = false;
          this.actionStates[action] = false;
      }
    }
    return diff;
  };

  KeyboardController.prototype.isActive = function(action) {
    return this.actionStates[action];
  };

  return KeyboardController;

})();

module.exports = KeyboardController;


},{}],3:[function(require,module,exports){
var KeyboardController, STAGE_HEIGHT, STAGE_WIDTH, SimSim, StopWatch, TheWorld, WorldBase, imageAssets, setupKeyboardController, setupPixi, setupSimulation, setupStats, setupStopWatch, update, vec2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

KeyboardController = require('./keyboard_controller.coffee');

SimSim = require('./simult_sim/index.coffee');

WorldBase = require('./simult_sim/world_base.coffee');

vec2 = function(x, y) {
  return new Box2D.Common.Math.b2Vec2(x, y);
};

STAGE_WIDTH = window.innerWidth;

STAGE_HEIGHT = window.innerHeight;

StopWatch = (function() {
  function StopWatch() {
    this.millis = this.currentTimeMillis;
  }

  StopWatch.prototype.lap = function() {
    var newMillis;
    newMillis = this.currentTimeMillis;
    this.lapMillis = newMillis - this.millis;
    this.millis = newMillis;
    return this.lapSeconds();
  };

  StopWatch.prototype.currentTimeMillis = function() {
    return new Date().getTime();
  };

  StopWatch.prototype.lapSeconds = function() {
    return this.lapMillis / 1000.0;
  };

  return StopWatch;

})();

window.local = {
  simulation: null,
  stopWatch: null,
  pixi: {
    stage: null,
    renderer: null,
    sprites: []
  },
  keyboardController: null,
  stats: null
};

imageAssets = ["pixibox_assets/ball.png", "pixibox_assets/box.jpg"];

TheWorld = (function(_super) {
  __extends(TheWorld, _super);

  function TheWorld(data) {
    if (data == null) {
      data = null;
    }
    console.log("New TheWorld");
    this.data = data || {
      nextId: 0,
      players: {},
      boxes: {}
    };
    this.gameObjects = {
      boxes: {}
    };
    this.setupPhysics();
    this.syncDataToGameObjects();
  }

  TheWorld.prototype.playerJoined = function(id) {
    var boxId;
    boxId = "B" + (this.nextId());
    this.data.boxes[boxId] = {
      x: 4,
      y: 2,
      angle: 0
    };
    this.data.players[id] = {
      boxId: boxId,
      controls: {
        forward: false,
        left: false,
        right: false
      }
    };
    this.syncDataToGameObjects();
    return console.log("Player " + id + " JOINED, @data is now", this.data);
  };

  TheWorld.prototype.playerLeft = function(id) {
    var boxId;
    if (boxId = this.data.players[id].boxId) {
      delete this.data.boxes[boxId];
    }
    delete this.data.players[id];
    this.syncDataToGameObjects();
    return console.log("Player " + id + " LEFT, @data is now", this.data);
  };

  TheWorld.prototype.step = function(dt) {
    this.applyControls();
    this.b2world.Step(dt, 3, 3);
    this.b2world.ClearForces();
    return this.moveSprites();
  };

  TheWorld.prototype.moveSprites = function() {
    var body, boxId, obj, position, sprite, _ref, _results;
    _ref = this.gameObjects.boxes;
    _results = [];
    for (boxId in _ref) {
      obj = _ref[boxId];
      body = obj.body;
      sprite = obj.sprite;
      position = body.GetPosition();
      sprite.position.x = position.x * 100;
      sprite.position.y = position.y * 100;
      _results.push(sprite.rotation = body.GetAngle());
    }
    return _results;
  };

  TheWorld.prototype.applyControls = function() {
    var a, body, con, f, id, player, r, v, _ref, _results;
    _ref = this.data.players;
    _results = [];
    for (id in _ref) {
      player = _ref[id];
      con = player.controls;
      body = this.gameObjects.boxes[player.boxId].body;
      if (con.forward) {
        r = body.GetAngle();
        f = 0.2 * body.GetMass();
        v = vec2(f * Math.cos(r), f * Math.sin(r));
        body.ApplyImpulse(v, body.GetWorldCenter());
      }
      if (con.left) {
        a = body.GetAngle();
        body.SetAngle(a - 0.06);
      }
      if (con.right) {
        a = body.GetAngle();
        _results.push(body.SetAngle(a + 0.06));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  TheWorld.prototype.toAttributes = function() {
    this.captureGameObjectsAsData();
    console.log("toAttributes", this.data);
    return this.data;
  };

  TheWorld.prototype.nextId = function() {
    var nid;
    nid = this.data.nextId;
    this.data.nextId += 1;
    return nid;
  };

  TheWorld.prototype.setupPhysics = function() {
    var gravity;
    gravity = vec2(0, 0);
    return this.b2world = new Box2D.Dynamics.b2World(vec2(0, 0), true);
  };

  TheWorld.prototype.syncDataToGameObjects = function() {
    var boxData, boxId, obj, _ref, _ref1, _results;
    _ref = this.data.boxes;
    for (boxId in _ref) {
      boxData = _ref[boxId];
      if (!this.gameObjects.boxes[boxId]) {
        obj = {};
        obj.body = this.makeBoxBody(boxData);
        obj.sprite = this.makeBoxSprite(boxData);
        window.local.pixi.stage.addChild(obj.sprite);
        this.gameObjects.boxes[boxId] = obj;
      }
    }
    _ref1 = this.gameObjects.boxes;
    _results = [];
    for (boxId in _ref1) {
      obj = _ref1[boxId];
      if (!this.data.boxes[boxId]) {
        this.b2world.DestroyBody(obj.body);
        _results.push(window.local.pixi.stage.removeChild(obj.sprite));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  TheWorld.prototype.captureGameObjectsAsData = function() {
    var boxData, boxId, obj, pos, _ref, _results;
    _ref = this.data.boxes;
    _results = [];
    for (boxId in _ref) {
      boxData = _ref[boxId];
      obj = this.gameObjects.boxes[boxId];
      pos = obj.body.GetPosition();
      boxData.x = pos.x;
      boxData.y = pos.y;
      _results.push(boxData.angle = obj.body.GetAngle());
    }
    return _results;
  };

  TheWorld.prototype.makeBoxBody = function(boxData) {
    var angularDamping, body, bodyDef, linearDamping, polyFixture, size;
    size = 0.5;
    linearDamping = 3;
    angularDamping = 3;
    polyFixture = new Box2D.Dynamics.b2FixtureDef();
    polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    polyFixture.density = 1;
    polyFixture.shape.SetAsBox(size, size);
    bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position.Set(boxData.x, boxData.y);
    bodyDef.angle = boxData.angle;
    body = this.b2world.CreateBody(bodyDef);
    body.CreateFixture(polyFixture);
    body.SetLinearDamping(linearDamping);
    body.SetAngularDamping(angularDamping);
    return body;
  };

  TheWorld.prototype.makeBoxSprite = function(boxData) {
    var box, size;
    size = 0.5;
    box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"));
    box.i = 0;
    box.anchor.x = box.anchor.y = 0.5;
    box.scale.x = size * 2;
    box.scale.y = size * 2;
    return box;
  };

  TheWorld.prototype.updateControl = function(id, action, value) {
    return this.data.players[id].controls[action] = value;
  };

  return TheWorld;

})(WorldBase);

window.onload = function() {
  var loader;
  setupStats();
  setupPixi();
  loader = new PIXI.AssetLoader(imageAssets);
  loader.onComplete = function() {
    setupSimulation();
    setupKeyboardController();
    setupStopWatch();
    return update();
  };
  return loader.load();
};

setupStopWatch = function() {
  var stopWatch;
  stopWatch = new StopWatch();
  stopWatch.lap();
  return window.local.stopWatch = stopWatch;
};

setupSimulation = function() {
  var simulation, url;
  url = "http://" + location.hostname + ":" + location.port;
  simulation = SimSim.create.socketIOSimulation({
    socketIO: io.connect(url),
    worldClass: TheWorld
  });
  return window.local.simulation = simulation;
};

setupStats = function() {
  var container, stats;
  container = document.createElement("div");
  document.body.appendChild(container);
  stats = new Stats();
  container.appendChild(stats.domElement);
  stats.domElement.style.position = "absolute";
  return window.local.stats = stats;
};

setupPixi = function() {
  var renderer, stage;
  stage = new PIXI.Stage(0xDDDDDD, true);
  renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, void 0, false);
  document.body.appendChild(renderer.view);
  window.local.pixi.stage = stage;
  return window.local.pixi.renderer = renderer;
};

setupKeyboardController = function() {
  var keyboardController;
  keyboardController = new KeyboardController({
    w: "forward",
    a: "left",
    d: "right",
    s: "back"
  });
  return window.local.keyboardController = keyboardController;
};

update = function() {
  var action, elapsedSeconds, sim, value, _ref;
  requestAnimationFrame(update);
  elapsedSeconds = window.local.stopWatch.lap();
  sim = window.local.simulation;
  _ref = window.local.keyboardController.update();
  for (action in _ref) {
    value = _ref[action];
    sim.worldProxy("updateControl", action, value);
  }
  sim.update(elapsedSeconds);
  window.local.pixi.renderer.render(window.local.pixi.stage);
  return window.local.stats.update();
};


},{"./keyboard_controller.coffee":2,"./simult_sim/index.coffee":8,"./simult_sim/world_base.coffee":17}],4:[function(require,module,exports){
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


},{"./event_emitter.coffee":6}],5:[function(require,module,exports){
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


},{}],6:[function(require,module,exports){
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


},{}],7:[function(require,module,exports){
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


},{}],8:[function(require,module,exports){
var createSimulation, createSimulationUsingSocketIO, createSocketIOClientAdapter;

require('../helpers.coffee');

createSimulation = function(opts) {
  var Client, ClientMessageFactory, GameEventFactory, Simulation, SimulationEventFactory, SimulationStateFactory, SimulationStateSerializer, TurnCalculator, UserEventSerializer, client, clientMessageFactory, gameEventFactory, simulation, simulationEventFactory, simulationStateFactory, simulationStateSerializer, turnCalculator, userEventSerializer;
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
  simulationStateSerializer = new SimulationStateSerializer(simulationStateFactory);
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


},{"../helpers.coffee":1,"./client.coffee":4,"./client_message_factory.coffee":5,"./game_event_factory.coffee":7,"./simulation.coffee":9,"./simulation_event_factory.coffee":10,"./simulation_state_factory.coffee":12,"./simulation_state_serializer.coffee":13,"./socket_io_client_adapter.coffee":14,"./turn_calculator.coffee":15,"./user_event_serializer.coffee":16}],9:[function(require,module,exports){
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
            _this._debug("GameEvent::TurnComplete.... simState is", _this.simState);
            _this.turnCalculator.advanceTurn(_this.simState);
            _this.lastTurnTime = timeInSeconds;
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
            checksum = _this.simulationStateSerializer.calcWorldChecksum(_this.simState.world);
            return gameEvent.checksumClosure(checksum);
          case 'GameEvent::StartGame':
            _this.ourId = gameEvent.ourId;
            _this.simState = _this.simulationStateSerializer.unpackSimulationState(gameEvent.gamestate);
            return _this._debug("GameEvent::StartGame.... gameEvent is", gameEvent, "simState is", _this.simState);
          case 'GameEvent::GamestateRequest':
            console.log("Processing gamestate request");
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


},{"../helpers.coffee":1}],10:[function(require,module,exports){
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


},{}],11:[function(require,module,exports){
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


},{"../helpers.coffee":1}],12:[function(require,module,exports){
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


},{"./simulation_state.coffee":11}],13:[function(require,module,exports){
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


},{"./simulation_state.coffee":11}],14:[function(require,module,exports){
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


},{"./event_emitter.coffee":6}],15:[function(require,module,exports){
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


},{"../helpers.coffee":1}],16:[function(require,module,exports){
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


},{}],17:[function(require,module,exports){
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


},{}]},{},[3])