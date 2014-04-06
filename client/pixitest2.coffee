KeyboardController = require './keyboard_controller.coffee'
SimSim = require './simult_sim/index.coffee'
WorldBase = require './simult_sim/world_base.coffee'
        
vec2 = (x,y) -> new Box2D.Common.Math.b2Vec2(x,y)

STAGE_WIDTH = window.innerWidth
STAGE_HEIGHT = window.innerHeight
METER = 100
bodies = []
actors = []
stage = null
renderer = null
world = null
stats = null
keyboardController = null
simulation = null

imageAssets = [
  "pixibox_assets/ball.png",
  "pixibox_assets/box.jpg"
]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
window.onload = ->
  setupStats()
  setupPixi()

  
  loader = new PIXI.AssetLoader(imageAssets)
  loader.onComplete = ->
    # setupSimulation()
    setupPhysics()
    setupKeyboardController()
    update()
  loader.load()

setupSimulation = ->
  url = "http://#{location.hostname}:#{location.port}"
  simulation = SimSim.create.socketIOSimulation
    socketIO: io.connect(url)
    worldClass: TheWorld

setupStats = ->
  container = document.createElement("div")
  document.body.appendChild(container)
  stats = new Stats()
  container.appendChild(stats.domElement)
  stats.domElement.style.position = "absolute"
  
setupPixi = ->
  stage = new PIXI.Stage(0xDDDDDD, true)
  renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, undefined, false)
  document.body.appendChild(renderer.view)

setupPhysics = ->
  console.log "phys"
  gravity = vec2(0,0)
  world = new Box2D.Dynamics.b2World(gravity, true)

  body = makeBoxBody(x: 4, y: 2, size: 0.5)
  bodies.push body

  sprite = makeBoxSprite(size: 0.5)
  stage.addChild sprite
  actors.push sprite

  body = makeBoxBody(x: 6, y: 2, size: 0.25)
  bodies.push body

  sprite = makeBoxSprite(size: 0.25)
  stage.addChild sprite
  actors.push sprite

setupKeyboardController = ->
  keyboardController = new KeyboardController(
    w: "forward"
    a: "turnLeft"
    d: "turnRight"
    s: "back"
  )

makeBoxBody = (opts) ->
  polyFixture = new Box2D.Dynamics.b2FixtureDef()
  polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape()
  polyFixture.density = 1

  polyFixture.shape.SetAsBox(opts.size,opts.size)

  bodyDef = new Box2D.Dynamics.b2BodyDef()
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody
  bodyDef.position.Set(opts.x, opts.y)

  body = world.CreateBody(bodyDef)
  body.CreateFixture(polyFixture)
  body.SetLinearDamping(3)
  body.SetAngularDamping(3)

  body

makeBoxSprite = (opts) ->
  box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"))
  box.i = 0
  box.anchor.x = box.anchor.y = 0.5
  box.scale.x = opts.size*2
  box.scale.y = opts.size*2
  box

update = ->
  requestAnimationFrame(update)
  
  box = bodies[0]
  keyboardController.update()
  if keyboardController.isActive("forward")
    r = box.GetAngle()
    f = 0.2 * box.GetMass()
    v = vec2(f*Math.cos(r), f*Math.sin(r))
    box.ApplyImpulse(v, box.GetWorldCenter())

  if keyboardController.isActive("turnRight")
    a = bodies[0].GetAngle()
    bodies[0].SetAngle(a+0.06)
  if keyboardController.isActive("turnLeft")
    a = bodies[0].GetAngle()
    bodies[0].SetAngle(a-0.06)

  world.Step(1 / 60,  3,  3)
  world.ClearForces()
  
  for i in [0...actors.length]
    body  = bodies[i]
    actor = actors[i]
    position = body.GetPosition()
    actor.position.x = position.x * 100
    actor.position.y = position.y * 100
    actor.rotation = body.GetAngle()
  
  renderer.render(stage)
  stats.update()


