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
    tankId = @data.nextId
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
    if tankId = @data.players[id].tankId
      delete @data.tanks[tankId]
    delete @data.players[id]
    console.log "Player #{id} LEFT, @data is now", @data

  step: (dt) ->
    for tankId,info of @data.tanks
      if info.controls.forward
        info.speed = 200
      else
        info.speed -= 4 if info.speed > 0
    
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

# class PlayerAdapter
#   constructor: (player,@game) ->
#     @shadow = null
#     @tank = null
#     @currentSpeed = 0
# 
#     #  The base of our tank
#     @tank = game.add.sprite(player.x, player.y, 'tank', 'tank1')
#     @tank.anchor.setTo(0.5, 0.5)
#     @tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true)
# 
#     #  This will force it to decelerate and limit its speed
#     game.physics.enable(tank, Phaser.Physics.ARCADE)
#     @tank.body.drag.set(0.2)
#     @tank.body.maxVelocity.setTo(400, 400)
#     @tank.body.collideWorldBounds = true
# 
# 
#     #  A shadow below our tank
#     @shadow = $GLOBAL.game.add.sprite(0, 0, 'tank', 'shadow')
#     @shadow.anchor.setTo(0.5, 0.5)
# 
#     @tank.bringToTop()


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

  # Resize our game world to be a 2000 x 2000 square
  $GLOBAL.game.world.setBounds(-1000, -1000, 2000, 2000)
  # $GLOBAL.game.world.setBounds(0,0,800,600)

  # Our tiled scrolling background
  $GLOBAL.land = $GLOBAL.game.add.tileSprite(0, 0, 800, 600, 'earth')
  $GLOBAL.land.fixedToCamera = true

  $GLOBAL.cursors = $GLOBAL.game.input.keyboard.createCursorKeys()

  # $GLOBAL.game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
  # $GLOBAL.game.camera.focusOnXY(0, 0)

  $GLOBAL.localControls = {up:false,left:false,right:false,down:false}

  setInterval(updateSimulation, 1000/30)

# 
# 
# 
#     #  A shadow below our tank
#     @shadow = $GLOBAL.game.add.sprite(0, 0, 'tank', 'shadow')
#     @shadow.anchor.setTo(0.5, 0.5)
# 

class Tank
  constructor: (@game,info) ->
    @tankSprite = @game.add.sprite(info.x,info.y, 'tank', 'tank1')
    @tankSprite.anchor.setTo(0.5, 0.5)
    @tankSprite.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true)
    # @game.physics.enable(@tankSprite, Phaser.Physics.ARCADE)
    # @tankSprite.body.drag.set(0.2)
    # @tankSprite.body.maxVelocity.setTo(400, 400)
    # @tankSprite.body.collideWorldBounds = true
    @tankSprite.bringToTop()

createTank = (game,info) ->
  tank = new Tank(game,info)
  # game.camera.follow(tank.tankSprite)
  # game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
  tank

destroyTank = (game,tank) ->
  tank.tankSprite.kill()

updateSimulation = ->
  now = new Date().getTime()
  elapsedSeconds = (now - $GLOBAL.beginTime)/1000.0
  $GLOBAL.simulation.update elapsedSeconds


update = ->


  tanks = $GLOBAL.clutch.tanks
  if world = $GLOBAL.simulation.worldState()
    for tankId,tankInfo of world.data.tanks
      tank = tanks[tankId]
      if !tank
        tank = createTank($GLOBAL.game, tankInfo)
        tanks[tankId] = tank
        console.log "Created tank #{tankId}",tank

      tank.tankSprite.angle = tankInfo.angle
      tank.tankSprite.x = tankInfo.x
      tank.tankSprite.y = tankInfo.y

      # if (tankInfo.speed > 0)
      #   $GLOBAL.game.physics.arcade.velocityFromRotation(
      #     tank.tankSprite.rotation
      #     tankInfo.speed
      #     tank.tankSprite.body.velocity
      #   )

      #
      # SUPER NAUGHTY.
      #  
      # tankInfo.x = tank.tankSprite.x.fixed()
      # tankInfo.y = tank.tankSprite.y.fixed()
      # WUH?
      # $GLOBAL.simulation.worldProxy 'setLoc', tank.tankSprite.x.fixed(), tank.tankSprite.y.fixed()

    for tankId,tank of tanks
      if !world.data.tanks[tankId]
        destroyTank($GLOBAL.game,tank)
      # console.log "Update tank #{tankId}"

  
  #  Position all the parts and align rotations
  # shadow.x = tank.x
  # shadow.y = tank.y
  # shadow.rotation = tank.rotation
        # update tank




  controls = $GLOBAL.localControls
  cursors = $GLOBAL.cursors

  up = cursors.up.isDown
  if up and !controls.up
    $GLOBAL.simulation.worldProxy 'moveForward', true
  if !up and controls.up
    $GLOBAL.simulation.worldProxy 'moveForward', false
  controls.up = up

  left = cursors.left.isDown
  if left and !controls.left
    $GLOBAL.simulation.worldProxy 'turnLeft', true
  if !left and controls.left
    $GLOBAL.simulation.worldProxy 'turnLeft', false
  controls.left = left

  right = cursors.right.isDown
  if right and !controls.right
    $GLOBAL.simulation.worldProxy 'turnRight', true
  if !right and controls.right
    $GLOBAL.simulation.worldProxy 'turnRight', false
  controls.right = right


    # console.log "CURSOR LEFT"
    #tank.angle -= 4
  # else if ($GLOBAL.cursors.right.isDown)
  #   turnRight = true
  #   console.log "CURSOR RIGHT"
    #tank.angle += 4
  # TODO ??? HOW DO I GET _MY_ PLAYER ID / TANK????
  # if turnLeft != simulation.worldState().


  $GLOBAL.land.tilePosition.x = -($GLOBAL.game.camera.x)
  $GLOBAL.land.tilePosition.y = -($GLOBAL.game.camera.y)

render = ->

$GLOBAL.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render })

window.$GLOBAL = $GLOBAL
