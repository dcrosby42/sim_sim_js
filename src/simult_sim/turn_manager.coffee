EventEmitter = require('events').EventEmitter
Timer = require './timer'

class TurnManager extends EventEmitter
  constructor: (@period) ->
    @timer = new Timer(@period, ((dt,elapsed) =>
      @emit 'turn_ended', @current, dt, elapsed
      @current += 1
    ))
    @current = 0

  start: ->
    @timer.start()

  stop: ->
    @timer.stop()

  reset: ->
    @current = 0

module.exports = TurnManager
