
class SimulationStateSerializer
  constructor: ->

  packSimulationState: (simState) -> simState

  unpackSimulationState: (data) -> data

  calcWorldChecksum: (world) -> "temporary world checksum"


module.exports = SimulationStateSerializer
