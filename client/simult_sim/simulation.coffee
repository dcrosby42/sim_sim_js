require '../helpers'
# EventEmitter = require './event_emitter'


class Simulation
  constructor: (@client,@turnCalculator,@simulationStateFactory,@simulationStateSerializer, @userEventSerializer) ->
    @simWorld = null
    @lastTurnTime = 0

  worldState: ->
    @simState.world if @simState

  quit: ->
    @client.disconnect()
    @simState = null

  # Accepts t (time) in partial seconds (floating point, eg, 1.75 seconds)
  update: (t) ->
    if @simState
      elapsedTurnTime = (t - @lastTurnTime).fixed()
      @turnCalculator.stepUntilTurnTime @simState, elapsedTurnTime

    @client.update (gameEvent) =>
      switch gameEvent.type
        when 'GameEvent::TurnComplete'
          @turnCalculator.advanceTurn @simState
          @lastTurnTime = t
          for simEvent in gameEvent.events
            switch simEvent.type

              when 'SimulationEvent::Event'
                userEvent = @userEventSerializer.unpack(simEvent.data)
                if userEvent.type == 'UserEvent::WorldProxyEvent'
                  @simState.world[userEvent.method](simEvent.playerId, userEvent.args...)
                else
                  @simState.world.incomingEvent(simEvent.playerId, userEvent)

              when 'SimulationEvent::PlayerJoined'
                @simState.world.playerJoined simEvent.playerId

              when 'SimulationEvent::PlayerLeft'
                @simState.world.playerLeft simEvent.playerId

          checksum = @simulationStateSerializer.calcWorldChecksum(@simState.world)
          gameEvent.checksumClosure(checksum)

        when 'GameEvent::StartGame'
          @ourId = gameEvent.ourId
          @simState = @simulationStateSerializer.unpackSimulationState(gameEvent.gamestate)

        when 'GameEvent::GamestateRequest'
          @simState ||= @simulationStateFactory.createSimulationState()
          packedSimState = @simulationStateSerializer.packSimulationState(@simState)
          gameEvent.gamestateClosure(packedSimState)

        when 'GameEvent::Disconnected'
          @simState = null
          # TODO: notify users of the simulation that we've been disconnected


module.exports = Simulation
