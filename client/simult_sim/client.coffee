EventEmitter = require './event_emitter'

class Client extends EventEmitter
  constructor: (@adapter,@gameEventFactory, @clientMessageFactory, @simulationEventFactory) ->
    @gameStarted = false
    @clientId = null
    @simulationEventsBuffer = []
    @gameEventsBuffer = []
    @preGameEventsBuffer = []

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
          turnEvents = []
          for i in [0...@simulationEventsBuffer.length]
            turnEvents.push @simulationEventsBuffer.shift()
           
          f = (checksum) ->
            @_sendMessage @clientMessageFactory.turnFinished(
              msg.turnNumber,
              checksum
            )
          @gameEventsBuffer.push @gameEventFactory.turnComplete(
            msg.turnNumber,
            turnEvents,
            f
          )

        when 'ServerMsg::StartGame'
          @gameStarted = true
          for simEvent in @_unpackProtoTurn(msg.protoTurn)
            @simulationEventsBuffer.push simEvent

          @preGameEventsBuffer.push @gameEventFactory.startGame(msg.yourId, msg.turnPeriod, msg.currentTurn, msg.gamestate)

        when 'ServerMsg::GamestateRequest'
          protoTurn = @_packProtoTurn(@simulationEventsBuffer)
          f = (gamestate) ->
            @_sendMessage @clientMessageFactory.gamestate(
              msg.forPlayerId,
              protoTurn,
              gamestate
            )
          gameEvent = @gameEventFactory.gamestateRequest(f)
          if @gameStarted
            @gameEventsBuffer.push gameEvent
          else
            @preGameEventsBuffer.push gameEvent




  update: (callback) ->
    for i in [0...@preGameEventsBuffer.length]
      callback @preGameEventsBuffer.shift()
    if @gameStarted
      for i in [0...@gameEventsBuffer.length]
        event = @gameEventsBuffer.shift()
        callback(event)

  sendEvent: (data) ->
    @_sendMessage @clientMessageFactory.event(data)
  
  disconnect: ->
    @adapter.disconnect()

  _unpackServerMessage: (data) ->
    data

  _packClientMessage: (msg) ->
    msg

  _packProtoTurn: (events) ->
    events

  _unpackProtoTurn: (protoTurn) ->
    protoTurn

  _sendMessage: (msg) ->
    @adapter.send @_packClientMessage(msg)

module.exports = Client
