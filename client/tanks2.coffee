
preload = ->
  game.load.atlas('tank', 'tanks_assets/tanks.png', 'tanks_assets/tanks.json')
  game.load.atlas('enemy', 'tanks_assets/enemy-tanks.png', 'tanks_assets/tanks.json')
  game.load.image('logo', 'tanks_assets/logo.png')
  game.load.image('bullet', 'tanks_assets/bullet.png')
  game.load.image('earth', 'tanks_assets/scorched_earth.png')
  game.load.spritesheet('kaboom', 'tanks_assets/explosion.png', 64, 64, 23)

land = null
shadow = null
tank = null

currentSpeed = 0
cursors = null

fireRate = 100
nextFire = 0

create = ->

  # Resize our game world to be a 2000 x 2000 square
  game.world.setBounds(-1000, -1000, 2000, 2000)

  # Our tiled scrolling background
  land = game.add.tileSprite(0, 0, 800, 600, 'earth')
  land.fixedToCamera = true

  #  The base of our tank
  tank = game.add.sprite(0, 0, 'tank', 'tank1')
  tank.anchor.setTo(0.5, 0.5)
  tank.animations.add('move', ['tank1', 'tank2', 'tank3', 'tank4', 'tank5', 'tank6'], 20, true)

  #  This will force it to decelerate and limit its speed
  game.physics.enable(tank, Phaser.Physics.ARCADE)
  tank.body.drag.set(0.2)
  tank.body.maxVelocity.setTo(400, 400)
  tank.body.collideWorldBounds = true


  #  A shadow below our tank
  shadow = game.add.sprite(0, 0, 'tank', 'shadow')
  shadow.anchor.setTo(0.5, 0.5)

  tank.bringToTop()

  game.camera.follow(tank)
  game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300)
  game.camera.focusOnXY(0, 0)

  cursors = game.input.keyboard.createCursorKeys()


update = ->
  if (cursors.left.isDown)
    tank.angle -= 4
  else if (cursors.right.isDown)
    tank.angle += 4

  if (cursors.up.isDown)
    #  The speed we'll travel at
    currentSpeed = 300
  else
    if (currentSpeed > 0)
      currentSpeed -= 4

  if (currentSpeed > 0)
    game.physics.arcade.velocityFromRotation(tank.rotation, currentSpeed, tank.body.velocity)

  land.tilePosition.x = -game.camera.x
  land.tilePosition.y = -game.camera.y

  #  Position all the parts and align rotations
  shadow.x = tank.x
  shadow.y = tank.y
  shadow.rotation = tank.rotation


render = ->

game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render })

