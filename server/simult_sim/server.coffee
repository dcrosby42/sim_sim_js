
class Server
  constructor: (@adapter, @turnManager, @serverMessageFactory) ->
    #@logfmt = require('logfmt')

    m = @serverMessageFactory
    @turnManager.on 'turn_ended', (currentTurn) =>
      @_debug "Turn #{currentTurn} ended"
      @_broadcast m.turnComplete(currentTurn)

    @adapter.on 'Network::PeerConnected', (id) =>
      @_debug "Network::PeerConnected",id
      @_send id, m.idAssigned(id)
      stateProviderId = @_selectOtherPlayer(id)
      @_debug "  (selected player #{stateProviderId} to provide state to newcomer #{id})"
      #@logfmt.log {selectedOtherPlayer: stateProviderId}
      
      if stateProviderId == id
        @_debug "  (first player in is #{id}, starting turn manager)"
        # hacksie: id == stateProviderId implies we're the first player.
        # Start the turn manager
        @turnManager.start()
      # Ask someone to send the state to the new player
      @_send stateProviderId, m.gamestateRequest(id)
      @_broadcast m.playerJoined(id)

    @adapter.on 'Network::PeerDisconnected', (id) =>
      @_debug "Network::PeerDisconnected #{id}"
      @_broadcast m.playerLeft(id)

    @adapter.on 'Network::PeerPacket', (id, data) =>
      @_debug 'Network::PeerPacket', id, data
      msg = @_unpackClientMessage(data)
      switch msg.type
        when 'ClientMsg::Event'
          @_debug 'ClientMsg::Event, broadcasting', m.event(id,msg.data)
          @_broadcast m.event(id, msg.data)
        when 'ClientMsg::Gamestate'
          @_debug "ClientMsg::Gamestate rec'd", msg
          @_send msg.forPlayerId, m.startGame(msg.forPlayerId, @turnManager.period, @turnManager.current, msg.protoTurn, msg.data)

        when 'ClientMsg::TurnFinished'
          @_debug "ClientMsg::TurnFinished"
          _ = null
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
    return id if @adapter.clientCount() == 1 # There's only one player

    if @adapter.clientIds[0] != id
      return @adapter.clientIds[0]
    else
      return @adapter.clientids[1]

  _debug: (args...) ->
    console.log ">>> [Server]", args...

module.exports = Server
