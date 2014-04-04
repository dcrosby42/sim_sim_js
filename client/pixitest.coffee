
STAGE_WIDTH = window.innerWidth
STAGE_HEIGHT = window.innerHeight
METER = 100
bodies = []
actors = []
stage = null
renderer = null
world = null
mouseJoint = null
touchX = null
touchY = null
isBegin = false
stats = null

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
MathUtil = ->

MathUtil.RADIANS = Math.PI / 180
MathUtil.DEGREES = 180 / Math.PI

MathUtil.rndRange = (min, max) -> min + (Math.random() * (max - min))

MathUtil.rndIntRange = (min, max) -> Math.round(MathUtil.rndRange(min, max))

MathUtil.toRadians = (degrees) -> degrees * MathUtil.RADIANS

MathUtil.toDegrees = (radians) -> radians * MathUtil.DEGREES

MathUtil.hitTest = (x1, y1, w1, h1, x2, y2, w2, h2) ->
  if (x1 + w1 > x2)
    if (x1 < x2 + w2)
      if (y1 + h1 > y2)
        if (y1 < y2 + h2)
          return true
  return false

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 
onLoad = ->
  container = document.createElement("div")
  document.body.appendChild(container)
  
  stats = new Stats()
  container.appendChild(stats.domElement)
  stats.domElement.style.position = "absolute"
  
  stage = new PIXI.Stage(0xDDDDDD, true)
  
  renderer = PIXI.autoDetectRenderer(STAGE_WIDTH, STAGE_HEIGHT, undefined, false)
  document.body.appendChild(renderer.view)
  
  loader = new PIXI.AssetLoader(["pixibox_assets/ball.png",
                                       "pixibox_assets/box.jpg"])
  loader.onComplete = loadAssets
  loader.load()

loadAssets = ->
  world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10),  true)
  
  polyFixture = new Box2D.Dynamics.b2FixtureDef()
  polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape()
  polyFixture.density = 1
  
  circleFixture	= new Box2D.Dynamics.b2FixtureDef()
  circleFixture.shape	= new Box2D.Collision.Shapes.b2CircleShape()
  circleFixture.density = 1
  circleFixture.restitution = 0.7
  
  bodyDef = new Box2D.Dynamics.b2BodyDef()
  bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody
  
  #down
  polyFixture.shape.SetAsBox(10, 1)
  bodyDef.position.Set(9, STAGE_HEIGHT / METER + 1)
  world.CreateBody(bodyDef).CreateFixture(polyFixture)
  
  #left
  polyFixture.shape.SetAsBox(1, 100)
  bodyDef.position.Set(-1, 0)
  world.CreateBody(bodyDef).CreateFixture(polyFixture)
  
  #right
  bodyDef.position.Set(STAGE_WIDTH / METER + 1, 0)
  world.CreateBody(bodyDef).CreateFixture(polyFixture)
  bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody
  
  for i in [0..29]
    bodyDef.position.Set(MathUtil.rndRange(0, STAGE_WIDTH) / METER, -MathUtil.rndRange(50, 5000) / METER)
    body = world.CreateBody(bodyDef)
    s = null
    if (Math.random() > 0.5)
      s = MathUtil.rndRange(70, 100)
      circleFixture.shape.SetRadius(s / 2 / METER)
      body.CreateFixture(circleFixture)
      bodies.push(body)
      
      ball = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/ball.png"))
      stage.addChild(ball)
      ball.i = i
      ball.anchor.x = ball.anchor.y = 0.5
      ball.scale.x = ball.scale.y = s / 100
      
      actors[actors.length] = ball
    else
      s = MathUtil.rndRange(50, 100)
      polyFixture.shape.SetAsBox(s / 2 / METER, s / 2 / METER)
      body.CreateFixture(polyFixture)
      bodies.push(body)
      
      box = new PIXI.Sprite(PIXI.Texture.fromFrame("pixibox_assets/box.jpg"))
      stage.addChild(box)
      box.i = i
      box.anchor.x = box.anchor.y = 0.5
      box.scale.x = s / 100
      box.scale.y = s / 100
      
      actors[actors.length] = box
  
  document.addEventListener("mousedown", ((event) ->
      isBegin = true
      onMove(event)
      document.addEventListener("mousemove", onMove, true)
  ), true)
  
  document.addEventListener("mouseup", ((event) ->
      document.removeEventListener("mousemove", onMove, true)
      isBegin = false
      touchX = undefined
      touchY = undefined
  ), true)
  
  renderer.view.addEventListener("touchstart", ((event) ->
      isBegin = true
      onMove(event)
      renderer.view.addEventListener("touchmove", onMove, true)
  ), true)
  
  renderer.view.addEventListener("touchend", ((event) ->
      renderer.view.removeEventListener("touchmove", onMove, true)
      isBegin = false
      touchX = undefined
      touchY = undefined
  ), true)
  
  update()
  
getBodyAtMouse = ->
  mousePos = new Box2D.Common.Math.b2Vec2(touchX, touchY)
  aabb = new Box2D.Collision.b2AABB()
  aabb.lowerBound.Set(touchX - 0.001, touchY - 0.001)
  aabb.upperBound.Set(touchX + 0.001, touchY + 0.001)
  body = null
  world.QueryAABB(
       ((fixture) ->
          if(fixture.GetBody().GetType() != Box2D.Dynamics.b2BodyDef.b2_staticBody)
              if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePos))
                  body = fixture.GetBody()
                  return false
          return true
      ), aabb)
  
  return body

onMove = (event) ->
  if (event["changedTouches"])
    touche = event["changedTouches"][0]
    touchX = touche.pageX / METER
    touchY = touche.pageY / METER
  else
    touchX = event.clientX / METER
    touchY = event.clientY / METER

update = ->
  requestAnimationFrame(update)
  
  if(isBegin && !mouseJoint)
    dragBody = getBodyAtMouse()
    if(dragBody)
      jointDef = new Box2D.Dynamics.Joints.b2MouseJointDef()
      jointDef.bodyA = world.GetGroundBody()
      jointDef.bodyB = dragBody
      jointDef.target.Set(touchX, touchY)
      jointDef.collideConnected = true
      jointDef.maxForce = 300.0 * dragBody.GetMass()
      mouseJoint = world.CreateJoint(jointDef)
      dragBody.SetAwake(true)
  
  if (mouseJoint)
    if(isBegin)
      mouseJoint.SetTarget(new Box2D.Common.Math.b2Vec2(touchX, touchY))
    else
      world.DestroyJoint(mouseJoint)
      mouseJoint = null
  
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



# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # 

window.onload = onLoad
