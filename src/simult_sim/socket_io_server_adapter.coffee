EventEmitter = require('events').EventEmitter

#
# Events:
#   PeerConnected source_id
#   PeerDisconnect source_id
#   PeerPackek source_id, packet
#
# clientCount
# clientIds
#
class SocketIOServerAdapter extends EventEmitter
  constructor: (@socketIO) ->
    @_clients = {}
    @clientIds = []
    @_refreshClientIds()
    @_setupConnHandlers()

  clientCount: ->
    @clientIds.length

  send: (id,data) ->
    @_clients[id].emit 'data', data

  broadcast: (data) ->
    @socketIO.sockets.emit 'data', data

  _setupConnHandlers: ->
    @socketIO.sockets.on 'connection', (socket) ->
      id = socket.id
      @_storeClient id, socket

      socket.on 'data', (data) ->
        @emit 'PeerPacket', id, data

      socket.on 'disconnect', ->
        @_removeClient id
        @emit 'PeerDisconnected', id

      @emit 'PeerConnected', id

  _storeClient: (id,socket) ->
    @_clients[id] = socket
    @_refreshClientIds()

  _removeClient: (id) ->
    delete @_clients[id]
    @_refreshClientIds()

  _refreshClientIds: ->
    @clientIds = (id for id,socket in @_clients)

module.exports = SocketIOServerAdapter
