class WorldBase
  playerJoined: (id) ->
    throw new Error("Please implement WorldBase#playerJoined")
  playerLeft: (id) ->
    throw new Error("Please implement WorldBase#playerLeft")
  incomingEvent: (id) ->
    throw new Error("Please implement WorldBase#incomingEvent")
  step: (dt) ->
    throw new Error("Please implement WorldBase#step")

  toAttributes: ->
    throw new Error("Please implement WorldBase#toAttributes")

  @fromAttributes: ->
    throw new Error("Please implement WorldBase.fromAttributes")


module.exports = WorldBase
