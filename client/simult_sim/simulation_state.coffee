# EventEmitter = require './event_emitter'

class SimulationState
  constructor: (@timePerTurn,
                @stepsPerTurn,
                @step,
                @world) ->
    @timePerStep = (@timePerTurn / @stepsPerTurn).fixed()

module.exports = SimulationState
