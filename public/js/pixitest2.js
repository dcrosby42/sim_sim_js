(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var METER, MathUtil, STAGE_HEIGHT, STAGE_WIDTH, actors, bodies, getBodyAtMouse, isBegin, loadAssets, mouseJoint, onLoad, onMove, renderer, stage, stats, touchX, touchY, update, world;

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
  loader = new PIXI.AssetLoader(["pixibox_assets/ball.png", "pixibox_assets/box.jpg"]);
  loader.onComplete = loadAssets;
  return loader.load();
};

loadAssets = function() {
  var ball, body, bodyDef, box, circleFixture, i, polyFixture, s, _i;
  world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10), true);
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
  world.CreateBody(bodyDef).CreateFixture(polyFixture);
  bodyDef.position.Set(STAGE_WIDTH / METER + 1, 0);
  world.CreateBody(bodyDef).CreateFixture(polyFixture);
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
  var actor, body, dragBody, i, jointDef, position, _i, _ref;
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


},{}]},{},[1])