class Client extends EventEmitter
  constructor: (@adapter,@gameEventFactory) ->
    @gameStarted = false
    @clientId = null
    @gameEventsBuffer = []
    @simulationEventsBuffer = []

    @adapter.on 'ClientAdapter::Disconnect', =>
      @gameEventsBuffer.push @gameEventFactory.disconnect()

    @adapter.on 'ClientAdapter::Packet', (data) =>
      msg = @_unpackServerMessage(data)
      switch msg.type
        when 'ServerMsg::IdAssigned'
          @clientId = msg.ourId
        when 'ServerMsg::Event'
          @simulationEventsBuffer.push @simulationEventFactory.event(msg.sourcePlayerId, msg.data)
        when 'ServerMsg::PlayerJoined'
          @simulationEventsBuffer.push @simulationEventFactory.playerJoined(msg.playerId)
        when 'ServerMsg::PlayerLeft'
          @simulationEventsBuffer.push @simulationEventFactory.playerLeft(msg.playerId)
        when 'ServerMsg::TurnComplete'
          console.log "TODO MOAR"
          #TODO MOAR





  update: ->

  _unpackServerMessage: (data) ->
    data

window.SimultSim.Client = Client

