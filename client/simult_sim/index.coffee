require '../helpers.coffee'

createSimulation = (opts={}) ->
  unless opts.adapter
      throw new error("Cannot build simulation without network adapter, such as SocketIOClientAdapter")
  unless opts.worldClass
      throw new Error("Cannot build simulation without worldClass, which must implement interface WorldBase")
  GameEventFactory = require './game_event_factory.coffee'
  ClientMessageFactory = require './client_message_factory.coffee'
  SimulationEventFactory = require './simulation_event_factory.coffee'
  Client = require './client.coffee'
  TurnCalculator = require './turn_calculator.coffee'
  SimulationStateFactory = require './simulation_state_factory.coffee'
  SimulationStateSerializer = require './simulation_state_serializer.coffee'
  UserEventSerializer = require './user_event_serializer.coffee'
  Simulation = require './simulation.coffee'
  ChecksumCalculator = require './checksum_calculator.coffee'

  gameEventFactory = new GameEventFactory()
  clientMessageFactory = new ClientMessageFactory()
  simulationEventFactory = new SimulationEventFactory()
  client = new Client(
    opts.adapter
    gameEventFactory
    clientMessageFactory
    simulationEventFactory
  )

  turnCalculator = new TurnCalculator()
  userEventSerializer = new UserEventSerializer()
  
  simulationStateFactory = new SimulationStateFactory(
    timePerTurn: opts.timesPerTurn || 0.1
    stepsPerTurn: opts.stepsPerTurn || 6
    step: opts.step || 0
    worldClass: opts.worldClass
  )

  checksumCalculator = new ChecksumCalculator()
  simulationStateSerializer = new SimulationStateSerializer(simulationStateFactory,checksumCalculator)

  simulation = new Simulation(
    client
    turnCalculator
    simulationStateFactory
    simulationStateSerializer
    userEventSerializer
  )

  return simulation

createSocketIOClientAdapter = (socketIO) ->
  SocketIOClientAdapter = require './socket_io_client_adapter.coffee'
  new SocketIOClientAdapter(socketIO)

createSimulationUsingSocketIO = (opts={}) ->
  opts.adapter = createSocketIOClientAdapter(opts.socketIO)
  createSimulation opts

exports.create =
  socketIOSimulation: createSimulationUsingSocketIO
