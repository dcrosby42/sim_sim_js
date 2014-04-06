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
    @_debugOn = false

  worldState: ->
    @simState.world if @simState

  clientId: ->
    @client.clientId

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

  # Accepts overall elapsed time in floating point seconds
  update: (timeInSeconds) ->
    if @simState
      elapsedTurnTime = (timeInSeconds - @lastTurnTime).fixed()
      @turnCalculator.stepUntilTurnTime @simState, elapsedTurnTime

    @client.update (gameEvent) =>
      switch gameEvent.type
        when 'GameEvent::TurnComplete'
          @_debug "GameEvent::TurnComplete.... simState is",@simState
          @turnCalculator.advanceTurn @simState
          @lastTurnTime = timeInSeconds
          for simEvent in gameEvent.events
            switch simEvent.type

              when 'SimulationEvent::Event'
                userEvent = @userEventSerializer.unpack(simEvent.data)
                if userEvent.type == 'UserEvent::WorldProxyEvent'
                  if @simState.world[userEvent.method]
                    @simState.world[userEvent.method](simEvent.playerId, userEvent.args...)
                  else
                    throw new Error("WorldProxyEvent with method #{userEvent.method} CANNOT BE APPLIED because the world object doesn't have that method!")
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
          console.log "Processing gamestate request"
          @simState ||= @simulationStateFactory.createSimulationState()
          packedSimState = @simulationStateSerializer.packSimulationState(@simState)
          gameEvent.gamestateClosure(packedSimState)

        when 'GameEvent::Disconnected'
          @simState = null
          # TODO: notify users of the simulation that we've been disconnected

  _debug: (args...) ->
    console.log "[Simulation]", args if @_debugOn

module.exports = Simulation
