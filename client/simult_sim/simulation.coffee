require '../helpers.coffee'
# EventEmitter = require './event_emitter'


class Simulation
  constructor: (
      @client
      @turnCalculator
      @simulationStateFactory
      @simulationStateSerializer
      @userEventSerializer
    ) ->
    @lastTurnTime = 0
    @_debugOn = true

  worldState: ->
    @simState.world if @simState

  quit: ->
    @client.disconnect()
    @simState = null

  worldProxy: (method, args...) ->
    @sendEvent
      type: 'UserEvent::WorldProxyEvent'
      method: method
      args: args

  sendEvent: (event) ->
    @_debug "sendEvent", event
    @client.sendEvent @userEventSerializer.pack(event)

  # Accepts t (time) in partial seconds (floating point, eg, 1.75 seconds)
  update: (t) ->
    if @simState
      elapsedTurnTime = (t - @lastTurnTime).fixed()
      @turnCalculator.stepUntilTurnTime @simState, elapsedTurnTime

    @client.update (gameEvent) =>
      switch gameEvent.type
        when 'GameEvent::TurnComplete'
          @_debug "GameEvent::TurnComplete.... simState is",@simState
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
          @_debug "GameEvent::StartGame.... gameEvent is", gameEvent ,"simState is",@simState

        when 'GameEvent::GamestateRequest'
          @simState ||= @simulationStateFactory.createSimulationState()
          packedSimState = @simulationStateSerializer.packSimulationState(@simState)
          gameEvent.gamestateClosure(packedSimState)

        when 'GameEvent::Disconnected'
          @simState = null
          # TODO: notify users of the simulation that we've been disconnected

  _debug: (args...) ->
    console.log "[Simulation]", args if @_debugOn

module.exports = Simulation
