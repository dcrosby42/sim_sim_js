$SIMSIM = require './simult_sim/index.coffee'
WorldBase = require './simult_sim/world_base.coffee'

class Tanks2World extends WorldBase
  constructor: (atts=null) ->
    @data = atts || {
      nextId: 0
      players: {}
      tanks: {}
    }

  playerJoined: (id) ->
    # Tanks are coming! Everyone gets a tank!
    tankId = "T#{@data.nextId}"
    @data.nextId += 1
    @data.tanks[tankId] = {
      x: 200
      y: 200
      angle: 0
      speed: 0
      controls: {
        left: false
        right: false
        forward: false
      }
    }
    @data.players[id] = { score: 0, tankId: tankId }
    console.log "Player #{id} JOINED, @data is now", @data

  playerLeft: (id) ->
    # Cleanup tank
    if tankId = @data.players[id].tankId
      delete @data.tanks[tankId]
    delete @data.players[id]
    console.log "Player #{id} LEFT, @data is now", @data

  step: (dt) ->
    # Update all the tanks:
    for tankId,info of @data.tanks
      if info.controls.forward
        info.speed = 200
      else
        info.speed -= 8 if info.speed > 0
    
      if info.controls.left
        info.angle -= 4

      if info.controls.right
        info.angle += 4

      r = (info.angle * Math.PI/180.0)
      info.x += dt* info.speed * Math.cos(r)
      info.y += dt*info.speed * Math.sin(r)



  toAttributes: ->
    @data

  moveForward: (id,active) ->
    # console.log "moveForward #{id} -> #{active}", @data
    if tank = @_playerTank(id)
      tank.controls.forward = active

  turnLeft: (id,active) ->
    # console.log "turnLeft #{id} -> #{active}", @data
    if tank = @_playerTank(id)
      tank.controls.left = active

  turnRight: (id,active) ->
    # console.log "turnRight #{id} -> #{active}", @data
    if tank = @_playerTank(id)
      tank.controls.right = active

  setLoc: (id,x,y) ->
    if tank = @_playerTank(id)
      tank.x = x
      tank.y = y

  _playerTank: (id) ->
    @data.tanks[@data.players[id].tankId]


$GLOBAL = {}
$GLOBAL.land = null
$GLOBAL.cursors = null
$GLOBAL.game = null
$GLOBAL.clutch = {tanks:{}}

preload = ->
  $GLOBAL.game.load.atlas('tank', 'tanks_assets/tanks.png', 'tanks_assets/tanks.json')
  $GLOBAL.game.load.atlas('enemy', 'tanks_assets/enemy-tanks.png', 'tanks_assets/tanks.json')
  $GLOBAL.game.load.image('logo', 'tanks_assets/logo.png')
  $GLOBAL.game.load.image('bullet', 'tanks_assets/bullet.png')
  $GLOBAL.game.load.image('earth', 'tanks_assets/scorched_earth.png')
  $GLOBAL.game.load.spritesheet('kaboom', 'tanks_assets/explosion.png', 64, 64, 23)

create = ->
  url = "http://#{location.hostname}:#{location.port}"
  $GLOBAL.simulation = $SIMSIM.create.socketIOSimulation
    socketIO: io.connect(url)
    worldClass: Tanks2World
  $GLOBAL.beginTime = new Date().getTime()

  $GLOBAL.game.world.setBounds(-1000, -1000, 2000, 2000)

  $GLOBAL.land = $GLOBAL.game.add.tileSprite(0, 0, 800, 600, 'earth')
  $GLOBAL.land.fixedToCamera = true

  $GLOBAL.cursors = $GLOBAL.game.input.keyboard.createCursorKeys()

  $GLOBAL.localControls = {up:false,left:false,right:false,down:false}

  # HOkay
  # Phaser's update loop pauses when tab goes out of focus.
  # We can't afford to miss SimSim messages so let's process in a different timer:
  setInterval(updateSimulation, 1000/30)

class Tank
  constructor: (@game,info) ->
    @tankSprite = @game.add.sprite(info.x,info.y, 'tank', 'tank1')
    @tankSprite.anchor.setTo(0.5, 0.5)
    @tankSprite.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true)

    # TODO ?  This was making life very confusing and difficult ... amounts to ad-hoc client prediction and was busting our sync:
    # @game.physics.enable(@tankSprite, Phaser.Physics.ARCADE)
    # @tankSprite.body.drag.set(0.2)
    # @tankSprite.body.maxVelocity.setTo(400, 400)
    # @tankSprite.body.collideWorldBounds = true

    @tankSprite.bringToTop()

createTank = (game,info) ->
  tank = new Tank(game,info)
  tank

destroyTank = (game,tank) ->
  tank.tankSprite.kill()

updateSimulation = ->
  now = new Date().getTime()
  elapsedSeconds = (now - $GLOBAL.beginTime)/1000.0
  $GLOBAL.simulation.update elapsedSeconds


update = ->

  if world = $GLOBAL.simulation.worldState()
    tanks = $GLOBAL.clutch.tanks # Our cache of Phaser game objects corresponding to tanks in world state
    for tankId,tankInfo of world.data.tanks
      tank = tanks[tankId]
      if !tank
        # A tank has appeared in the world state that we're not yet mirroring in Phaser.
        tank = createTank($GLOBAL.game, tankInfo) # build new tank object
        tanks[tankId] = tank # store in the 'clutch'

      # Sync the Phaser game state based on current world state:
      tank.tankSprite.angle = tankInfo.angle
      tank.tankSprite.x = tankInfo.x
      tank.tankSprite.y = tankInfo.y

    # Check for tanks that have DISAPPEARED from world state
    for tankId,tank of tanks
      if !world.data.tanks[tankId]
        # a tank that we WERE tracking is gone, so get it gone from Phaser:
        destroyTank($GLOBAL.game,tank)

  #
  # CONTROLLER INPUT EVENTS
  #
  controls = $GLOBAL.localControls
  cursors = $GLOBAL.cursors

  # If 'up' has gone up or come down, update the moveForward control
  up = cursors.up.isDown
  if up and !controls.up
    $GLOBAL.simulation.worldProxy 'moveForward', true
  if !up and controls.up
    $GLOBAL.simulation.worldProxy 'moveForward', false
  controls.up = up

  # If 'left' has gone up or come down, update the turnLeft control
  left = cursors.left.isDown
  if left and !controls.left
    $GLOBAL.simulation.worldProxy 'turnLeft', true
  if !left and controls.left
    $GLOBAL.simulation.worldProxy 'turnLeft', false
  controls.left = left

  # If 'right' has gone up or come down, update the turnRight control
  right = cursors.right.isDown
  if right and !controls.right
    $GLOBAL.simulation.worldProxy 'turnRight', true
  if !right and controls.right
    $GLOBAL.simulation.worldProxy 'turnRight', false
  controls.right = right

  # TODO Scroll the background:
  # $GLOBAL.land.tilePosition.x = -($GLOBAL.game.camera.x)
  # $GLOBAL.land.tilePosition.y = -($GLOBAL.game.camera.y)

render = -> # TODO something interesting here?

$GLOBAL.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render })

window.$GLOBAL = $GLOBAL
