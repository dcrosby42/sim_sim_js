(function() {
  var adapter, socket;

  socket = io.connect(location.toString());

  adapter = new SimultSim.SocketIOClientAdapter(socket);

  adapter.on('ClientAdapter::Packet', function(data) {
    return console.log("ClientAdapter::Packet", data);
  });

  adapter.on('ClientAdapter::Disconnect', function() {
    console.log("ClientAdapter::Disconnect", data);
    return console.log("DISCONNECTED!");
  });

  console.log("Main done.");

}).call(this);
