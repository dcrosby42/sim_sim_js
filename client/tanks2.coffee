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
      turretAngle: 0
      speed: 0
      controls: {
        left: false
        right: false
        forward: false
        turretLeft: false
        turretRight: false
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

      if info.controls.turretLeft
        info.turretAngle -= 4

      if info.controls.turretRight
        info.turretAngle += 4

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

  spinTurretRight: (id,active) ->
    if tank = @_playerTank(id)
      tank.controls.turretRight = active

  spinTurretLeft: (id,active) ->
    if tank = @_playerTank(id)
      tank.controls.turretLeft = active

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
  $GLOBAL.cursors.turretLeft = $GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.A)
  $GLOBAL.cursors.turretRight = $GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.D)

  $GLOBAL.localControls = {up:false,left:false,right:false,down:false, turretLeft:false,turretRight:false}

  # HOkay
  # Phaser's update loop pauses when tab goes out of focus.
  # We can't afford to miss SimSim messages so let's process in a different timer:
  setInterval(updateSimulation, 1000/30)

class Tank
  constructor: (@game,info) ->
    @chassis = @game.add.sprite(info.x,info.y, 'tank', 'tank1')
    @chassis.anchor.setTo(0.5, 0.5)
    @chassis.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true)
    @turret = game.add.sprite(info.x, info.y, 'tank', 'turret')
    @turret.anchor.setTo(0.3, 0.5)

    @shadow = @game.add.sprite(0, 0, 'tank', 'shadow')
    @shadow.anchor.setTo(0.5, 0.5)

    

    # TODO ?  This was making life very confusing and difficult ... amounts to ad-hoc client prediction and was busting our sync:
    # @game.physics.enable(@chassis, Phaser.Physics.ARCADE)
    # @chassis.body.drag.set(0.2)
    # @chassis.body.maxVelocity.setTo(400, 400)
    # @chassis.body.collideWorldBounds = true

    @chassis.bringToTop()
    @turret.bringToTop()

  kill: ->
    @chassis.kill()
    @shadow.kill()
    @turret.kill()



createTank = (game,info) ->
  tank = new Tank(game,info)
  tank

destroyTank = (game,tank) ->
  tank.kill()

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
        me = $GLOBAL.simulation.clientId()
        console.log "Created tank #{tankId}.  My id is #{me} and I own tank #{world.data.players[me].tankId}"
        if world.data.players[me].tankId == tankId
          console.log "THIS IS MY TANK LET'S CAMERA FOLLOW"
          $GLOBAL.game.camera.follow(tank.chassis)
          $GLOBAL.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)

      # Sync the Phaser game state based on current world state:
      tank.chassis.angle = tankInfo.angle
      tank.chassis.x = tankInfo.x
      tank.chassis.y = tankInfo.y
      tank.shadow.angle = tankInfo.angle
      tank.shadow.x = tankInfo.x
      tank.shadow.y = tankInfo.y
      tank.turret.x = tankInfo.x
      tank.turret.y = tankInfo.y
      tank.turret.angle = tankInfo.angle + tankInfo.turretAngle

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

  turretRight = cursors.turretRight.isDown
  if turretRight and !controls.turretRight
    $GLOBAL.simulation.worldProxy 'spinTurretRight', true
  if !turretRight and controls.turretRight
    $GLOBAL.simulation.worldProxy 'spinTurretRight', false
  controls.turretRight = turretRight

  turretLeft = cursors.turretLeft.isDown
  if turretLeft and !controls.turretLeft
    $GLOBAL.simulation.worldProxy 'spinTurretLeft', true
  if !turretLeft and controls.turretLeft
    $GLOBAL.simulation.worldProxy 'spinTurretLeft', false
  controls.turretLeft = turretLeft

  # TODO Scroll the background:
  $GLOBAL.land.tilePosition.x = -($GLOBAL.game.camera.x)
  $GLOBAL.land.tilePosition.y = -($GLOBAL.game.camera.y)

render = -> # TODO something interesting here?

$GLOBAL.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render })

window.$GLOBAL = $GLOBAL
