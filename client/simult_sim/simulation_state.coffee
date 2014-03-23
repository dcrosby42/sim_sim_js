# EventEmitter = require './event_emitter'

class SimulationState
  constructor: (@timePerTurn,
                @stepsPerTurn,
                @turn,
                @subStep,
                @world) ->

  turn: ->
    throw new Error("SimulationState.turn NOT IMPLEMENTED")

  stepTime: ->
    throw new Error("SimulationState.turn NOT IMPLEMENTED")

  stepUntil: ->
    throw new Error("SimulationState.turn NOT IMPLEMENTED")


module.exports = SimulationState
