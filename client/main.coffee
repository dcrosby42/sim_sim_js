
socket = io.connect(location.toString())
adapter = new SimultSim.SocketIOClientAdapter(socket)

adapter.on 'ClientAdapter::Packet', (data) ->
  console.log "ClientAdapter::Packet", data
  
adapter.on 'ClientAdapter::Disconnect', ->
  console.log "ClientAdapter::Disconnect", data
  console.log "DISCONNECTED!"

console.log "Main done."
