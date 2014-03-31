(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var create, currentSpeed, cursors, fireRate, game, land, nextFire, preload, render, shadow, tank, update;

preload = function() {
  game.load.atlas('tank', 'tanks_assets/tanks.png', 'tanks_assets/tanks.json');
  game.load.atlas('enemy', 'tanks_assets/enemy-tanks.png', 'tanks_assets/tanks.json');
  game.load.image('logo', 'tanks_assets/logo.png');
  game.load.image('bullet', 'tanks_assets/bullet.png');
  game.load.image('earth', 'tanks_assets/scorched_earth.png');
  return game.load.spritesheet('kaboom', 'tanks_assets/explosion.png', 64, 64, 23);
};

land = null;

shadow = null;

tank = null;

currentSpeed = 0;

cursors = null;

fireRate = 100;

nextFire = 0;

create = function() {
  game.world.setBounds(-1000, -1000, 2000, 2000);
  land = game.add.tileSprite(0, 0, 800, 600, 'earth');
  land.fixedToCamera = true;
  tank = game.add.sprite(0, 0, 'tank', 'tank1');
  tank.anchor.setTo(0.5, 0.5);
  tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true);
  game.physics.enable(tank, Phaser.Physics.ARCADE);
  tank.body.drag.set(0.2);
  tank.body.maxVelocity.setTo(400, 400);
  tank.body.collideWorldBounds = true;
  shadow = game.add.sprite(0, 0, 'tank', 'shadow');
  shadow.anchor.setTo(0.5, 0.5);
  tank.bringToTop();
  game.camera.follow(tank);
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
  game.camera.focusOnXY(0, 0);
  return cursors = game.input.keyboard.createCursorKeys();
};

update = function() {
  if (cursors.left.isDown) {
    tank.angle -= 4;
  } else if (cursors.right.isDown) {
    tank.angle += 4;
  }
  if (cursors.up.isDown) {
    currentSpeed = 300;
  } else {
    if (currentSpeed > 0) {
      currentSpeed -= 4;
    }
  }
  if (currentSpeed > 0) {
    game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity);
  }
  land.tilePosition.x = -game.camera.x;
  land.tilePosition.y = -game.camera.y;
  shadow.x = tank.x;
  shadow.y = tank.y;
  return shadow.rotation = tank.rotation;
};

render = function() {};

game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', {
  preload: preload,
  create: create,
  update: update,
  render: render
});


},{}]},{},[1])