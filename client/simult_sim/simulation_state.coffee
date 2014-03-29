require '../helpers'

class SimulationState
  constructor: (@timePerTurn,
                @stepsPerTurn,
                @step,
                @world) ->
    @timePerStep = (@timePerTurn / @stepsPerTurn).fixed()

module.exports = SimulationState
