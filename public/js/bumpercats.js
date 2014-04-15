(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var KeyboardController, PIover2, STAGE_HEIGHT, STAGE_WIDTH, SimSim, StopWatch, TheWorld, WorldBase, imageAssets, setupKeyboardController, setupPixi, setupSimulation, setupStats, setupStopWatch, update, vec2,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

StopWatch = require('./stop_watch.coffee');

KeyboardController = require('./keyboard_controller.coffee');

SimSim = require('./simult_sim/index.coffee');

WorldBase = require('./simult_sim/world_base.coffee');

vec2 = function(x, y) {
  return new Box2D.Common.Math.b2Vec2(x, y);
};

PIover2 = Math.PI / 2;

STAGE_WIDTH = window.innerWidth;

STAGE_HEIGHT = window.innerHeight;

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

imageAssets = ["pixibox_assets/ball.png", "pixibox_assets/box.jpg", "pixibox_assets/bumpercat_red.png"];

TheWorld = (function(_super) {
  __extends(TheWorld, _super);

  function TheWorld(data) {
    if (data == null) {
      data = null;
    }
    this.thrust = 0.2;
    this.turnSpeed = 0.06;
    this.data = data || {
      nextId: 0,
      players: {},
      boxes: {}
    };
    this.gameObjects = {
      boxes: {}
    };
    this.setupPhysics();
    this.syncNeeded = true;
  }

  TheWorld.prototype.playerJoined = function(id) {
    var boxId;
    boxId = "B" + (this.nextId());
    this.data.boxes[boxId] = {
      x: 4.0,
      y: 2.0,
      angle: 0,
      vx: 0.0,
      vy: 0.0
    };
    this.data.players[id] = {
      boxId: boxId,
      controls: {
        forward: false,
        left: false,
        right: false
      }
    };
    this.syncNeeded = true;
    return console.log("Player " + id + " JOINED, @data is now", this.data);
  };

  TheWorld.prototype.playerLeft = function(id) {
    var boxId;
    if (boxId = this.data.players[id].boxId) {
      delete this.data.boxes[boxId];
    }
    delete this.data.players[id];
    this.syncNeeded = true;
    return console.log("Player " + id + " LEFT, @data is now", this.data);
  };

  TheWorld.prototype.step = function(dt) {
    this.syncDataToGameObjects();
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
      _results.push(sprite.rotation = body.GetAngle() + PIover2);
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
        f = this.thrust * body.GetMass();
        v = vec2(f * Math.cos(r), f * Math.sin(r));
        body.ApplyImpulse(v, body.GetWorldCenter());
      }
      if (con.left) {
        a = body.GetAngle();
        body.SetAngle(a - this.turnSpeed);
      }
      if (con.right) {
        a = body.GetAngle();
        _results.push(body.SetAngle(a + this.turnSpeed));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  TheWorld.prototype.toAttributes = function() {
    this.captureGameObjectsAsData();
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
    var boxData, boxId, e, obj, _ref, _ref1, _results;
    if (!this.syncNeeded) {
      return;
    }
    this.syncNeeded = false;
    _ref = this.data.boxes;
    for (boxId in _ref) {
      boxData = _ref[boxId];
      if (!this.gameObjects.boxes[boxId]) {
        try {
          obj = {};
          obj.body = this.makeBoxBody(boxData);
          obj.sprite = this.makeBoxSprite(boxData);
          window.local.pixi.stage.addChild(obj.sprite);
          this.gameObjects.boxes[boxId] = obj;
        } catch (_error) {
          e = _error;
          console.log("OOPS adding box " + boxId, e);
        }
      }
    }
    _ref1 = this.gameObjects.boxes;
    _results = [];
    for (boxId in _ref1) {
      obj = _ref1[boxId];
      if (!this.data.boxes[boxId]) {
        try {
          this.b2world.DestroyBody(obj.body);
          window.local.pixi.stage.removeChild(obj.sprite);
          _results.push(delete this.gameObjects.boxes[boxId]);
        } catch (_error) {
          e = _error;
          _results.push(console.log("OOPS removing box " + boxId, e));
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  TheWorld.prototype.captureGameObjectsAsData = function() {
    var boxData, boxId, obj, pos, vel, _ref, _results;
    _ref = this.data.boxes;
    _results = [];
    for (boxId in _ref) {
      boxData = _ref[boxId];
      obj = this.gameObjects.boxes[boxId];
      pos = obj.body.GetPosition();
      vel = obj.body.GetLinearVelocity();
      boxData.x = pos.x;
      boxData.y = pos.y;
      boxData.angle = obj.body.GetAngle();
      boxData.vx = vel.x;
      _results.push(boxData.vy = vel.y);
    }
    return _results;
  };

  TheWorld.prototype.makeBoxBody = function(boxData) {
    var angularDamping, body, bodyDef, linearDamping, polyFixture, size;
    size = 1;
    linearDamping = 3;
    angularDamping = 3;
    polyFixture = new Box2D.Dynamics.b2FixtureDef();
    polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    polyFixture.density = 1;
    polyFixture.shape.SetAsBox(0.71, 0.4);
    bodyDef = new Box2D.Dynamics.b2BodyDef();
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    bodyDef.position.Set(boxData.x, boxData.y);
    bodyDef.angle = boxData.angle;
    bodyDef.linearVelocity = vec2(boxData.vx, boxData.vy);
    bodyDef.awake = true;
    body = this.b2world.CreateBody(bodyDef);
    body.CreateFixture(polyFixture);
    body.SetLinearDamping(linearDamping);
    body.SetAngularDamping(angularDamping);
    return body;
  };

  TheWorld.prototype.makeBoxSprite = function(boxData) {
    var box, size;
    size = 1;
    box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/bumpercat_red.png"));
    box.i = 0;
    box.anchor.x = box.anchor.y = 0.5;
    box.scale.x = size;
    box.scale.y = size;
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
    s: "back",
    up: "forward",
    left: "left",
    right: "right",
    back: "back"
  });
  return window.local.keyboardController = keyboardController;
};

update = function() {
  var action, sim, value, _ref;
  requestAnimationFrame(update);
  sim = window.local.simulation;
  _ref = window.local.keyboardController.update();
  for (action in _ref) {
    value = _ref[action];
    sim.worldProxy("updateControl", action, value);
  }
  sim.update(window.local.stopWatch.elapsedSeconds());
  window.local.pixi.renderer.render(window.local.pixi.stage);
  return window.local.stats.update();
};


},{"./keyboard_controller.coffee":3,"./simult_sim/index.coffee":9,"./simult_sim/world_base.coffee":18,"./stop_watch.coffee":19}],2:[function(require,module,exports){
Number.prototype.fixed = function(n) {
  n = n || 3;
  return parseFloat(this.toFixed(n));
};


},{}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
var CRC32_TABLE, ChecksumCalculator;

CRC32_TABLE = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";

ChecksumCalculator = (function() {
  function ChecksumCalculator() {}

  ChecksumCalculator.prototype.calculate = function(str, crc) {
    var i, n, x, _i, _ref;
    if (crc == null) {
      crc = 0;
    }
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


},{}],5:[function(require,module,exports){
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


},{"./event_emitter.coffee":7}],6:[function(require,module,exports){
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


},{}],7:[function(require,module,exports){
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


},{}],8:[function(require,module,exports){
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


},{}],9:[function(require,module,exports){
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


},{"../helpers.coffee":2,"./checksum_calculator.coffee":4,"./client.coffee":5,"./client_message_factory.coffee":6,"./game_event_factory.coffee":8,"./simulation.coffee":10,"./simulation_event_factory.coffee":11,"./simulation_state_factory.coffee":13,"./simulation_state_serializer.coffee":14,"./socket_io_client_adapter.coffee":15,"./turn_calculator.coffee":16,"./user_event_serializer.coffee":17}],10:[function(require,module,exports){
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
            _this._debug("GameEvent::TurnComplete", new Date().getTime());
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


},{"../helpers.coffee":2}],11:[function(require,module,exports){
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


},{}],12:[function(require,module,exports){
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


},{"../helpers.coffee":2}],13:[function(require,module,exports){
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


},{"./simulation_state.coffee":12}],14:[function(require,module,exports){
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


},{"./simulation_state.coffee":12}],15:[function(require,module,exports){
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


},{"./event_emitter.coffee":7}],16:[function(require,module,exports){
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


},{"../helpers.coffee":2}],17:[function(require,module,exports){
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


},{}],18:[function(require,module,exports){
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


},{}],19:[function(require,module,exports){
var StopWatch;

StopWatch = (function() {
  function StopWatch() {
    this.start = this.currentTimeMillis();
    this.millis = this.start;
  }

  StopWatch.prototype.lap = function() {
    var newMillis;
    newMillis = this.currentTimeMillis();
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

  StopWatch.prototype.elapsedSeconds = function() {
    return (this.currentTimeMillis() - this.start) / 1000.0;
  };

  return StopWatch;

})();

module.exports = StopWatch;


},{}]},{},[1])