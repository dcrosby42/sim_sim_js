SimulationState = require './simulation_state.coffee'

class SimulationStateSerializer
  constructor: (@simulationStateFactory) ->

  packSimulationState: (simState) ->
    {
      timePerTurn: simState.timePerTurn
      stepsPerTurn: simState.stepsPerTurn
      step: simState.step
      world: simState.world.toAttributes()
    }

  unpackSimulationState: (data) ->

    new SimulationState(
      data.timePerTurn
      data.stepsPerTurn
      data.step
      @simulationStateFactory.createWorld(data.world))

  calcWorldChecksum: (world) -> "temporary world checksum"


module.exports = SimulationStateSerializer
