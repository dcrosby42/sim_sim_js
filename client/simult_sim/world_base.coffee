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

module.exports = WorldBase
