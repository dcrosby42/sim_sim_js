
StopWatch = require './stop_watch.coffee'
KeyboardController = require './keyboard_controller.coffee'
ChecksumCalculator = require './checksum_calculator.coffee'
        
vec2 = (x,y) -> new Box2D.Common.Math.b2Vec2(x,y)
fixFloat = SimSim.Util.fixFloat

HalfPI = Math.PI/2

# STAGE_WIDTH = window.innerWidth
# STAGE_HEIGHT = window.innerHeight

STAGE_WIDTH = 800
STAGE_HEIGHT = 600

window.local =
  simulation: null
  stopWatch: null
  pixi:
    stage: null
    renderer: null
  keyboardController: null
  stats: null
  vars: {}

imageAssets = [
  "pixibox_assets/ball.png",
  "pixibox_assets/box.jpg"
  "pixibox_assets/bumpercat_red.png"
]

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
class TheWorld extends SimSim.WorldBase
  constructor: () ->
    @checksumCalculator = new ChecksumCalculator()
    @thrust = 0.2
    @turnSpeed = 0.06

    @data = @defaultData()
    
    @gameObjects =
      boxes: {}
    @setupPhysics()
    @syncNeeded = true

  defaultData: ->
    {
      nextId: 0
      players: {}
      boxes: {}
    }

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
    @syncNeeded = true
    console.log "Player #{id} JOINED, @data is now", @data

  playerLeft: (id) ->
    if boxId = @data.players[id].boxId
      delete @data.boxes[boxId]
    delete @data.players[id]
    @syncNeeded = true
    console.log "Player #{id} LEFT, @data is now", @data
    
  step: (dt) ->
    @syncDataToGameObjects()
    @applyControls()

    # Step the physics simulation:
    @b2world.Step(dt,  3,  3)
    @b2world.ClearForces()
    
    @moveSprites()
  
  setData: (data) ->
    @data = @defaultData()
    @syncNeeded = true
    @syncDataToGameObjects()
    @data = data
    @syncNeeded = true
    

  getData: ->
    @captureGameObjectsAsData()
    @data

  getChecksum: ->
    @checksumCalculator.calculate JSON.stringify(@getData())

  #
  # Invocable via proxy:
  #

  updateControl: (id, action,value) ->
    @data.players[id].controls[action] = value
    turn = window.local.simulation.currentTurnNumber
    sim = window.local.simulation
    

  #
  # Internal:
  #

  moveSprites: ->
    for boxId,obj of @gameObjects.boxes
      body = obj.body
      sprite = obj.sprite
      # Update sprite locations based on their bodies:
      position = body.GetPosition()
      sprite.position.x = position.x * 100
      sprite.position.y = position.y * 100
      sprite.rotation = body.GetAngle() + HalfPI

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

  nextId: ->
    nid = @data.nextId
    @data.nextId += 1
    nid

  setupPhysics: ->
    gravity = vec2(0,0)
    @b2world = new Box2D.Dynamics.b2World(vec2(0,0), true)

  syncDataToGameObjects: ->
    return unless @syncNeeded
    @syncNeeded=false
    # Boxes:
    for boxId,boxData of @data.boxes
      if !@gameObjects.boxes[boxId]
        try
          # A box exists in @data that is NOT represented in game objects
          obj = {}
          obj.body = @makeBoxBody(boxData)
          obj.sprite = @makeBoxSprite(boxData)
          window.local.pixi.stage.addChild(obj.sprite)
          @gameObjects.boxes[boxId] = obj
        catch e
          console.log "OOPS adding box #{boxId}", e

    for boxId,obj of @gameObjects.boxes
      if !@data.boxes[boxId]
        try
          # A box game object exists for a box that has disappeared from @data
          @b2world.DestroyBody(obj.body)
          window.local.pixi.stage.removeChild(obj.sprite)
          delete @gameObjects.boxes[boxId]
        catch e
          console.log "OOPS removing box #{boxId}", e


  captureGameObjectsAsData: ->
    # Boxes:
    for boxId,boxData of @data.boxes
      obj = @gameObjects.boxes[boxId]
      if obj
        pos = obj.body.GetPosition()
        vel = obj.body.GetLinearVelocity()
        boxData.x = fixFloat(pos.x)
        boxData.y = fixFloat(pos.y)
        boxData.angle = fixFloat(obj.body.GetAngle())
        boxData.vx = fixFloat(vel.x)
        boxData.vy = fixFloat(vel.y)

        
  makeBoxBody: (boxData) ->
    size = 1
    linearDamping = 3
    angularDamping = 3

    polyFixture = new Box2D.Dynamics.b2FixtureDef()
    polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape()
    polyFixture.density = 1
    polyFixture.shape.SetAsBox(0.71,0.4)

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
    size = 1
    # box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"))
    box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/bumpercat_red.png"))
    box.i = 0
    box.anchor.x = box.anchor.y = 0.5
    box.scale.x = size
    box.scale.y = size
    box


    
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
  simulation = SimSim.create.socketIOSimulation(
    socketIO: io.connect(url)
    world: new TheWorld()
  )
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
    up: "forward"
    left: "left"
    right: "right"
    back: "back"
  )
  window.local.keyboardController = keyboardController


update = ->
  requestAnimationFrame(update)

  sim = window.local.simulation
  for action,value of window.local.keyboardController.update()
    sim.worldProxy "updateControl", action, value
  
  sim.update(window.local.stopWatch.elapsedSeconds())

  
  window.local.pixi.renderer.render(window.local.pixi.stage)
  window.local.stats.update()



window.dropEvents = ->
  console.log "Drop events"
  window.local.vars.dropEvents = true

window.stopDroppingEvents = ->
  console.log "Stop dropping events"
  window.local.vars.dropEvents = false

window.takeSnapshot = ->
  d = window.local.simulation.world.getData()
  ss = JSON.parse(JSON.stringify(d))
  console.log ss
  window.local.vars.snapshot = ss

window.restoreSnapshot = ->
  ss = window.local.vars.snapshot
  console.log ss
  window.local.simulation.world.setData ss
