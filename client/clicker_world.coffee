WorldBase = require './simult_sim/world_base.coffee'

class ClickerWorld extends WorldBase
  constructor: (atts={}) ->
    @_debugOn = true
    @players = atts.players || {}

  # @fromAttributes: (data) ->
  #   w = new ClickerWorld()
  #   w.players = data.players
  #   w

  playerJoined: (id) ->
    @players[id] = {score: 0}
    @_debug "Player #{id} JOINED"

  playerLeft: (id) ->
    delete @players[id]
    @_debug "Player #{id} LEFT"

  step: (dt) ->

  addScore: (id, score) ->
    @players[id].score += score
    @_debug "UPDATED player #{id} score to #{@players[id].score}"

  toAttributes: ->
    {
      players: @players
    }

  _debug: (args...) -> console.log "[MyWorld]", args... if @_debugOn

module.exports = ClickerWorld
