require '../helpers.coffee'

class TurnCalculator

  advanceTurn: (simState) ->
    @stepUntil simState, simState.stepsPerTurn
    simState.step = 0

  stepUntilTurnTime: (simState, turnTime) ->
    shouldBeStep = Math.round(turnTime / simState.timePerStep)
    @stepUntil simState, shouldBeStep

  stepUntil: (simState,n) ->
    limit = simState.stepsPerTurn
    limit = n if n < limit
    while simState.step < limit
      simState.step += 1
      simState.world.step simState.timePerStep

module.exports = TurnCalculator
