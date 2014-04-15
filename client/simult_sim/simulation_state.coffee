require '../helpers.coffee'

class SimulationState
  constructor: (@timePerTurn,
                @stepsPerTurn,
                @step,
                @world) ->
    @timePerStep = (@timePerTurn / @stepsPerTurn).fixed()
    @checksum = 0

module.exports = SimulationState
