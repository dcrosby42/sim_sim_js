

SocketIOClientAdapter = require './simult_sim/socket_io_client_adapter.coffee'
GameEventFactory = require './simult_sim/game_event_factory.coffee'
ClientMessageFactory = require './simult_sim/client_message_factory.coffee'
SimulationEventFactory = require './simult_sim/simulation_event_factory.coffee'
Client = require './simult_sim/client.coffee'
TurnCalculator = require './simult_sim/turn_calculator.coffee'
SimulationStateFactory = require './simult_sim/simulation_state_factory.coffee'
SimulationStateSerializer = require './simult_sim/simulation_state_serializer.coffee'
UserEventSerializer = require './simult_sim/user_event_serializer.coffee'
Simulation = require './simult_sim/simulation.coffee'
WorldBase = require './simult_sim/world_base.coffee'


socket = io.connect(location.toString())
adapter = new SocketIOClientAdapter(socket)
gameEventFactory = new GameEventFactory()
clientMessageFactory = new ClientMessageFactory()
simulationEventFactory = new SimulationEventFactory()
client = new Client(
  adapter
  gameEventFactory
  clientMessageFactory
  simulationEventFactory
)

turnCalculator = new TurnCalculator()
userEventSerializer = new UserEventSerializer()

class MyWorld extends WorldBase
  constructor: ->
    @_debugOn = true
    @players = {}

  @fromAttributes: (data) ->
    w = new MyWorld()
    w.players = data.players

  playerJoined: (id) ->
    @players[id] = {score: 0}
    @_debug "Player #{id} JOINED"

  playerLeft: (id) ->
    delete @players[id]
    @_debug "Player #{id} LEFT"

  step: (dt) ->

  addScore: (id, score) ->
    @players[id].score += score
    @_debug "Updating player #{id} score to #{@players[id].score}"

  toAttributes: ->
    {
      players: @players
    }

  _debug: (args...) -> console.log "[MyWorld]", args... if @_debugOn


simulationStateFactory = new SimulationStateFactory(
  timePerTurn: 0.1
  stepsPerTurn: 6
  step: 0
  worldClass: MyWorld
)

simulationStateSerializer = new SimulationStateSerializer(simulationStateFactory)

simulation = new Simulation(
  client
  turnCalculator
  simulationStateFactory
  simulationStateSerializer
  userEventSerializer
)


window.simulation = simulation

period = 20
beginTime = new Date().getTime()
webTimer = setInterval (->
  now = new Date().getTime()
  elapsed = now - beginTime
  simulation.update(elapsed)), period

window.stop = -> clearInterval(webTimer)
