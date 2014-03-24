# EventEmitter = require './event_emitter'

class SimulationState
  constructor: (@timePerTurn,
                @stepsPerTurn,
                @step,
                @world) ->
    @timePerStep = (@timePerTurn / @stepsPerTurn).fixed()

  # turn: ->
  #   throw new Error("SimulationState.turn NOT IMPLEMENTED")

  # stepTime: ->
  #   throw new Error("SimulationState.turn NOT IMPLEMENTED")

  # stepUntil: ->
  #   throw new Error("SimulationState.turn NOT IMPLEMENTED")


module.exports = SimulationState
