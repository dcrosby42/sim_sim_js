# EventEmitter = require './event_emitter'


class Simulation
  constructor: (@client,@turnCalculator,@simulationStateFactory,@simulationStateSerializer, @userEventSerializer) ->
    @simWorld = null

  worldState: ->
    @simState.world if @simState

  quit: ->
    @client.disconnect()
    @simState = null

  update: (t) ->
    @client.update (gameEvent) =>
      switch gameEvent.type
        when 'GameEvent::TurnComplete'
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
