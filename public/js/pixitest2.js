(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
var KeyboardController, METER, MathUtil, STAGE_HEIGHT, STAGE_WIDTH, actors, bodies, getBodyAtMouse, isBegin, keyboardController, loadAssets, loadAssets2, makeBoxBody, makeBoxSprite, mouseJoint, onLoad, onMove, renderer, stage, stats, touchX, touchY, update, vec2, world;

KeyboardController = require('./keyboard_controller.coffee');

vec2 = function(x, y) {
  return new Box2D.Common.Math.b2Vec2(x, y);
};

STAGE_WIDTH = window.innerWidth;

STAGE_HEIGHT = window.innerHeight;

METER = 100;

bodies = [];

actors = [];

stage = null;

renderer = null;

world = null;

mouseJoint = null;

touchX = null;

touchY = null;

isBegin = false;

stats = null;

keyboardController = null;

MathUtil = function() {};

MathUtil.RADIANS = Math.PI / 180;

MathUtil.DEGREES = 180 / Math.PI;

MathUtil.rndRange = function(min, max) {
  return min + (Math.random() * (max - min));
};

MathUtil.rndIntRange = function(min, max) {
  return Math.round(MathUtil.rndRange(min, max));
};

MathUtil.toRadians = function(degrees) {
  return degrees * MathUtil.RADIANS;
};

MathUtil.toDegrees = function(radians) {
  return radians * MathUtil.DEGREES;
};

MathUtil.hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2) {
  if (x1 + w1 > x2) {
    if (x1 < x2 + w2) {
      if (y1 + h1 > y2) {
        if (y1 < y2 + h2) {
          return true;
        }
      }
    }
  }
  return false;
};

onLoad = function() {
  var container, loader;
  container = document.createElement("div");
  document.body.appendChild(container);
  stats = new Stats();
  container.appendChild(stats.domElement);
  stats.domElement.style.position = "absolute";
  stage = new PIXI.Stage(0xDDDDDD, true);
  renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, void 0, false);
  document.body.appendChild(renderer.view);
  keyboardController = new KeyboardController({
    w: "forward",
    a: "turnLeft",
    d: "turnRight",
    s: "back"
  });
  loader = new PIXI.AssetLoader(["pixibox_assets/ball.png", "pixibox_assets/box.jpg"]);
  loader.onComplete = loadAssets2;
  return loader.load();
};

loadAssets2 = function() {
  var body, body2, box, box2, gravity;
  gravity = vec2(0, 0);
  world = new Box2D.Dynamics.b2World(gravity, true);
  body = makeBoxBody({
    x: 8,
    y: 2,
    size: 0.5
  });
  bodies.push(body);
  box = makeBoxSprite({
    size: 0.5
  });
  stage.addChild(box);
  actors.push(box);
  body2 = makeBoxBody({
    x: 2,
    y: 2,
    size: 0.5
  });
  bodies.push(body2);
  box2 = makeBoxSprite({
    size: 0.5
  });
  stage.addChild(box2);
  actors.push(box2);
  return update();
};

makeBoxBody = function(opts) {
  var body, bodyDef, polyFixture;
  polyFixture = new Box2D.Dynamics.b2FixtureDef();
  polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
  polyFixture.density = 1;
  polyFixture.shape.SetAsBox(opts.size, opts.size);
  bodyDef = new Box2D.Dynamics.b2BodyDef();
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  bodyDef.position.Set(opts.x, opts.y);
  body = world.CreateBody(bodyDef);
  body.CreateFixture(polyFixture);
  body.SetLinearDamping(3);
  body.SetAngularDamping(3);
  return body;
};

makeBoxSprite = function(opts) {
  var box;
  box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"));
  box.i = 0;
  box.anchor.x = box.anchor.y = 0.5;
  box.scale.x = opts.size * 2;
  box.scale.y = opts.size * 2;
  return box;
};

loadAssets = function() {
  var ball, body, bodyDef, box, circleFixture, gravity, i, polyFixture, s, _i;
  gravity = new Box2D.Common.Math.b2Vec2(0, 10);
  world = new Box2D.Dynamics.b2World(gravity, true);
  polyFixture = new Box2D.Dynamics.b2FixtureDef();
  polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
  polyFixture.density = 1;
  circleFixture = new Box2D.Dynamics.b2FixtureDef();
  circleFixture.shape = new Box2D.Collision.Shapes.b2CircleShape();
  circleFixture.density = 1;
  circleFixture.restitution = 0.7;
  bodyDef = new Box2D.Dynamics.b2BodyDef();
  bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
  polyFixture.shape.SetAsBox(10, 1);
  bodyDef.position.Set(9, STAGE_HEIGHT / METER + 1);
  world.CreateBody(bodyDef).CreateFixture(polyFixture);
  polyFixture.shape.SetAsBox(1, 100);
  bodyDef.position.Set(-1, 0);
  bodyDef.position.Set(STAGE_WIDTH / METER + 1, 0);
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
  for (i = _i = 0; _i <= 29; i = ++_i) {
    bodyDef.position.Set(MathUtil.rndRange(0, STAGE_WIDTH) / METER, -MathUtil.rndRange(50, 5000) / METER);
    body = world.CreateBody(bodyDef);
    s = null;
    if (Math.random() > 0.5) {
      s = MathUtil.rndRange(70, 100);
      circleFixture.shape.SetRadius(s / 2 / METER);
      body.CreateFixture(circleFixture);
      bodies.push(body);
      ball = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/ball.png"));
      stage.addChild(ball);
      ball.i = i;
      ball.anchor.x = ball.anchor.y = 0.5;
      ball.scale.x = ball.scale.y = s / 100;
      actors[actors.length] = ball;
    } else {
      s = MathUtil.rndRange(50, 100);
      polyFixture.shape.SetAsBox(s / 2 / METER, s / 2 / METER);
      body.CreateFixture(polyFixture);
      bodies.push(body);
      box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"));
      stage.addChild(box);
      box.i = i;
      box.anchor.x = box.anchor.y = 0.5;
      box.scale.x = s / 100;
      box.scale.y = s / 100;
      actors[actors.length] = box;
    }
  }
  document.addEventListener("mousedown", (function(event) {
    isBegin = true;
    onMove(event);
    return document.addEventListener("mousemove", onMove, true);
  }), true);
  document.addEventListener("mouseup", (function(event) {
    document.removeEventListener("mousemove", onMove, true);
    isBegin = false;
    touchX = void 0;
    return touchY = void 0;
  }), true);
  renderer.view.addEventListener("touchstart", (function(event) {
    isBegin = true;
    onMove(event);
    return renderer.view.addEventListener("touchmove", onMove, true);
  }), true);
  renderer.view.addEventListener("touchend", (function(event) {
    renderer.view.removeEventListener("touchmove", onMove, true);
    isBegin = false;
    touchX = void 0;
    return touchY = void 0;
  }), true);
  return update();
};

getBodyAtMouse = function() {
  var aabb, body, mousePos;
  mousePos = new Box2D.Common.Math.b2Vec2(touchX, touchY);
  aabb = new Box2D.Collision.b2AABB();
  aabb.lowerBound.Set(touchX - 0.001, touchY - 0.001);
  aabb.upperBound.Set(touchX + 0.001, touchY + 0.001);
  body = null;
  world.QueryAABB((function(fixture) {
    if (fixture.GetBody().GetType() !== Box2D.Dynamics.b2BodyDef.b2_staticBody) {
      if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePos)) {
        body = fixture.GetBody();
        return false;
      }
    }
    return true;
  }), aabb);
  return body;
};

onMove = function(event) {
  var touche;
  if (event["changedTouches"]) {
    touche = event["changedTouches"][0];
    touchX = touche.pageX / METER;
    return touchY = touche.pageY / METER;
  } else {
    touchX = event.clientX / METER;
    return touchY = event.clientY / METER;
  }
};

update = function() {
  var a, actor, body, box, dragBody, f, i, jointDef, position, r, v, _i, _ref;
  requestAnimationFrame(update);
  if (isBegin && !mouseJoint) {
    dragBody = getBodyAtMouse();
    if (dragBody) {
      jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef();
      jointDef.bodyA = world.GetGroundBody();
      jointDef.bodyB = dragBody;
      jointDef.target.Set(touchX, touchY);
      jointDef.collideConnected = true;
      jointDef.maxForce = 300.0 * dragBody.GetMass();
      mouseJoint = world.CreateJoint(jointDef);
      dragBody.SetAwake(true);
    }
  }
  if (mouseJoint) {
    if (isBegin) {
      mouseJoint.SetTarget(new Box2D.Common.Math.b2Vec2(touchX, touchY));
    } else {
      world.DestroyJoint(mouseJoint);
      mouseJoint = null;
    }
  }
  box = bodies[0];
  keyboardController.update();
  if (keyboardController.isActive("forward")) {
    r = box.GetAngle();
    f = 0.2 * box.GetMass();
    v = vec2(f * Math.cos(r), f * Math.sin(r));
    box.ApplyImpulse(v, box.GetWorldCenter());
  }
  if (keyboardController.isActive("turnRight")) {
    a = bodies[0].GetAngle();
    bodies[0].SetAngle(a + 0.06);
  }
  if (keyboardController.isActive("turnLeft")) {
    a = bodies[0].GetAngle();
    bodies[0].SetAngle(a - 0.06);
  }
  world.Step(1 / 60, 3, 3);
  world.ClearForces();
  for (i = _i = 0, _ref = actors.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    body = bodies[i];
    actor = actors[i];
    position = body.GetPosition();
    actor.position.x = position.x * 100;
    actor.position.y = position.y * 100;
    actor.rotation = body.GetAngle();
  }
  renderer.render(stage);
  return stats.update();
};

window.onload = onLoad;


},{"./keyboard_controller.coffee":1}]},{},[2])