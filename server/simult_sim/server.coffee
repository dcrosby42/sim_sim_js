
class Server
  constructor: (@adapter, @turnManager, @serverMessageFactory) ->
    @logfmt = require('logfmt')

    m = @serverMessageFactory
    @turnManager.on 'TurnEnded', (currentTurn) =>
      @_broadcast m.turnComplete(currentTurn)

    @adapter.on 'Network::PeerConnected', (id) =>
      @_send id, m.idAssigned(id)
      stateProviderId = @_selectOtherPlayer(id)
      @logfmt.log {selectedOtherPlayer: stateProviderId}
      
      if stateProviderId == id
        # hacksie: id == stateProviderId implies we're the first player.
        # Start the turn manager
        @turnManager.start()
      # Ask someone to send the state to the new player
      @_send stateProviderId, m.gamestateRequest(id)
      @_broadcast m.playerJoined(id)

    @adapter.on 'Network::PeerDisconnected', (id) =>
      @_broadcast m.playerLeft(id)

    @adapter.on 'Network::PeerPacket', (id, data) =>
      msg = @_unpackClientMessage(data)
      switch msg
        when 'ClientMsg::Event'
          @_broadcast m.event(id, msg.data)
        when 'ClientMsg::Gamestate'
          @_send msg.forPlayerId, m.startGame(msg.forPlayerId, @turnManager.period, @turnManager.current, msg.protoTurn, msg.data)

        #when 'ClientMsg::TurnFinished'
          # TODO: do something toward checksu verification here

  _send: (id, msg) ->
    @adapter.send id, @_packServerMessage(msg)

  _broadcast: (msg) ->
    @adapter.broadcast @_packServerMessage(msg)

  _unpackClientMessage: (msg) ->
    msg

  _packServerMessage: (msg) ->
    msg

  _selectOtherPlayer: (id) ->
    # @logfmt.log
    #   id:id
    #   clientCount: @adapter.clientCount()
    #   clientIds_0: @adapter.clientIds[0]
    #   clientIds_1: @adapter.clientIds[1]

    return id if @adapter.clientCount() == 1
    if @adapter.clientIds[0] != id
      return @adapter.clientIds[0]
    else
      return @adapter.clientids[1]

module.exports = Server
