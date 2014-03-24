require '../helpers'

class TurnCalculator

  advanceTurn: (simState) ->
    @stepUntil simState, simState.stepsPerTurn
    simState.step = 0

  stepUntilTurnTime: (simState, turnTime) ->
    shouldBeStep = Math.round(turnTime / simState.timePerStep)
    @stepUntil simState, shouldBeStep

    # if not @sim_state.nil?

    #   this_turn_time = t.to_f - @last_turn_time
    #   should_be_at_step = [(this_turn_time / @sim_state.step_time).round, @sim_state.steps_per_turn].min
    #   @sim_state.step_until(should_be_at_step)
    # end

  stepUntil: (simState,n) ->
    limit = simState.stepsPerTurn
    limit = n if n < limit
    while simState.step < limit
      simState.step += 1
      simState.world.step simState.timePerStep

module.exports = TurnCalculator
