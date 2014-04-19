require '../helpers.coffee'

class SimulationState
  constructor: (@timePerTurn,
                @stepsPerTurn,
                @step) ->
    @timePerStep = (@timePerTurn / @stepsPerTurn).fixed()

module.exports = SimulationState
