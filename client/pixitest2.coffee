StopWatch = require './stop_watch.coffee'
KeyboardController = require './keyboard_controller.coffee'
SimSim = require './simult_sim/index.coffee'
WorldBase = require './simult_sim/world_base.coffee'
        
vec2 = (x,y) -> new Box2D.Common.Math.b2Vec2(x,y)

STAGE_WIDTH = window.innerWidth
STAGE_HEIGHT = window.innerHeight

window.local =
  simulation: null
  stopWatch: null
  pixi:
    stage: null
    renderer: null
    sprites: []
  keyboardController: null
  stats: null

imageAssets = [
  "pixibox_assets/ball.png",
  "pixibox_assets/box.jpg"
]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
class TheWorld extends WorldBase
  constructor: (data=null) ->
    @thrust = 0.05
    @turnSpeed = 0.06

    @data = data || {
      nextId: 0
      players: {}
      boxes: {}
    }
    @gameObjects =
      boxes: {}
    @setupPhysics()
    @syncDataToGameObjects()

  playerJoined: (id) ->
    boxId = "B#{@nextId()}"
    @data.boxes[boxId] = {
      x: 4.0
      y: 2.0
      angle: 0
      vx: 0.0
      vy: 0.0
    }
    @data.players[id] = { boxId: boxId, controls: {forward:false,left:false,right:false} }
    @syncDataToGameObjects()
    console.log "Player #{id} JOINED, @data is now", @data

  playerLeft: (id) ->
    if boxId = @data.players[id].boxId
      delete @data.boxes[boxId]
    delete @data.players[id]
    @syncDataToGameObjects()
    console.log "Player #{id} LEFT, @data is now", @data
    
  step: (dt) ->
    @applyControls()

    # Step the physics simulation:
    @b2world.Step(dt,  3,  3)
    @b2world.ClearForces()
    
    @moveSprites()

  moveSprites: ->
    for boxId,obj of @gameObjects.boxes
      body = obj.body
      sprite = obj.sprite
      # Update sprite locations based on their bodies:
      position = body.GetPosition()
      sprite.position.x = position.x * 100
      sprite.position.y = position.y * 100
      sprite.rotation = body.GetAngle()

  applyControls: ->
    for id,player of @data.players
      con = player.controls
      body = @gameObjects.boxes[player.boxId].body
      if con.forward
        r = body.GetAngle()
        f = @thrust * body.GetMass()
        v = vec2(f*Math.cos(r), f*Math.sin(r))
        body.ApplyImpulse(v, body.GetWorldCenter())
      if con.left
        a = body.GetAngle()
        body.SetAngle(a - @turnSpeed)
      if con.right
        a = body.GetAngle()
        body.SetAngle(a + @turnSpeed)

  toAttributes: ->
    @captureGameObjectsAsData()
    console.log "toAttributes", @data
    @data

  nextId: ->
    nid = @data.nextId
    @data.nextId += 1
    nid

  setupPhysics: ->
    gravity = vec2(0,0)
    @b2world = new Box2D.Dynamics.b2World(vec2(0,0), true)

  syncDataToGameObjects: ->
    # Boxes:
    for boxId,boxData of @data.boxes
      if !@gameObjects.boxes[boxId]
        # A box exists in @data that is NOT represented in game objects
        obj = {}
        obj.body = @makeBoxBody(boxData)
        obj.sprite = @makeBoxSprite(boxData)
        window.local.pixi.stage.addChild(obj.sprite)
        @gameObjects.boxes[boxId] = obj

    for boxId,obj of @gameObjects.boxes
      if !@data.boxes[boxId]
        # A box game object exists for a box that has disappeared from @data
        @b2world.DestroyBody(obj.body)
        window.local.pixi.stage.removeChild(obj.sprite)

  captureGameObjectsAsData: ->
    # Boxes:
    for boxId,boxData of @data.boxes
      obj = @gameObjects.boxes[boxId]
      pos = obj.body.GetPosition()
      vel = obj.body.GetLinearVelocity()
      boxData.x = pos.x
      boxData.y = pos.y
      boxData.angle = obj.body.GetAngle()
      boxData.vx = vel.x
      boxData.vy = vel.y

        
  makeBoxBody: (boxData) ->
    size = 0.5
    linearDamping = 0
    angularDamping = 0

    polyFixture = new Box2D.Dynamics.b2FixtureDef()
    polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape()
    polyFixture.density = 1
    polyFixture.shape.SetAsBox(size,size)

    bodyDef = new Box2D.Dynamics.b2BodyDef()
    bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody
    bodyDef.position.Set(boxData.x, boxData.y)
    bodyDef.angle = boxData.angle
    bodyDef.linearVelocity = vec2(boxData.vx,boxData.vy)
    bodyDef.awake = true

    body = @b2world.CreateBody(bodyDef)
    body.CreateFixture(polyFixture)
    body.SetLinearDamping(linearDamping)
    body.SetAngularDamping(angularDamping)

    body
        
  makeBoxSprite: (boxData) ->
    size = 0.5
    box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"))
    box.i = 0
    box.anchor.x = box.anchor.y = 0.5
    box.scale.x = size * 2
    box.scale.y = size * 2
    box

  updateControl: (id, action,value) ->
    @data.players[id].controls[action] = value

    
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
window.onload = ->
  setupStats()
  setupPixi()

  loader = new PIXI.AssetLoader(imageAssets)
  loader.onComplete = ->
    setupSimulation()
    setupKeyboardController()
    setupStopWatch()
    update()
  loader.load()

setupStopWatch = ->
  stopWatch = new StopWatch()
  stopWatch.lap()
  window.local.stopWatch = stopWatch

setupSimulation = ->
  url = "http://#{location.hostname}:#{location.port}"
  simulation = SimSim.create.socketIOSimulation
    socketIO: io.connect(url)
    worldClass: TheWorld
  window.local.simulation = simulation

setupStats = ->
  container = document.createElement("div")
  document.body.appendChild(container)
  stats = new Stats()
  container.appendChild(stats.domElement)
  stats.domElement.style.position = "absolute"

  window.local.stats = stats
  
setupPixi = ->
  stage = new PIXI.Stage(0xDDDDDD, true)
  renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, undefined, false)
  document.body.appendChild(renderer.view)

  window.local.pixi.stage = stage
  window.local.pixi.renderer = renderer

setupKeyboardController = ->
  keyboardController = new KeyboardController(
    w: "forward"
    a: "left"
    d: "right"
    s: "back"
  )
  window.local.keyboardController = keyboardController


update = ->
  requestAnimationFrame(update)

  elapsedSeconds = window.local.stopWatch.lap()
  
  sim = window.local.simulation

  for action,value of  window.local.keyboardController.update()
    sim.worldProxy "updateControl", action, value
  
  sim.update(elapsedSeconds)

  
  window.local.pixi.renderer.render(window.local.pixi.stage)
  window.local.stats.update()


