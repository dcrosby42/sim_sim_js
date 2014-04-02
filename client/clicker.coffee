
$SIMSIM = require './simult_sim/index.coffee'

ClickerWorld = require './clicker_world.coffee'

startSimulation = ->
  # Connect and create simulation
  url = "http://#{location.hostname}:#{location.port}"
  simulation = $SIMSIM.create.socketIOSimulation
    socketIO: io.connect(url)
    worldClass: ClickerWorld

  period = 20
  beginTime = new Date().getTime()
  webTimer = setInterval (->
    now = new Date().getTime()
    elapsedSeconds = (now - beginTime)/1000.0
    simulation.update( elapsedSeconds )
    if world = simulation.worldState()
      sb = window.document.getElementById('score-board')
      if sb
        str = ''
        for id,player of world.players
          str += "Player #{id} score: #{player.score}\n"
        str += "Time: #{new Date().getTime()}\n"
        sb.textContent = str

    ), period

  window.simulation = simulation

  window.scoreButtonClicked = ->
    simulation.worldProxy('addScore', 1)

window.startSimulation = startSimulation
