SimulationState = require './simulation_state.coffee'

class SimulationStateFactory
  constructor: (@defaults) ->

  createSimulationState: ->
    new SimulationState(
      @defaults.timePerTurn
      @defaults.stepsPerTurn
      0 # step
      @createWorld(@defaults.worldData || null)
    )

  createWorld: (atts) ->
    if @defaults.worldClass
      return new @defaults.worldClass(atts)
    else
      throw new Error("SimulationStateFactory needs a worldClass")

module.exports = SimulationStateFactory
