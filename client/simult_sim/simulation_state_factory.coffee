SimulationState = require './simulation_state.coffee'

class SimulationStateFactory
  constructor: (@defaults) ->

  createSimulationState: ->
    new SimulationState(
      @defaults.timePerTurn
      @defaults.stepsPerTurn
      0 # step
      @_defaultWorld()
    )

  _defaultWorld: ->
    world = null
    if @defaults.world
      world = @defaults.world
    else if @defaults.createWorld
      world = @defaults.createWorld()
    return world

module.exports = SimulationStateFactory
