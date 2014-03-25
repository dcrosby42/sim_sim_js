SimulationStateSerializer = require '../../../client/simult_sim/simulation_state_serializer'

describe 'SimulationStateSerialzier', ->
  
  beforeEach ->
    @subject = new SimulationStateSerializer()
  
  describe 'packSimulationState', ->
    it 'is currently a noop', ->
      data = "hello this is whatever"
      packed = @subject.packSimulationState(data)
      expect(packed).toEqual data
    
  describe 'unpackSimulationState', ->
    it 'is currently a noop', ->
      packed = "hello this is whatever"
      data = @subject.unpackSimulationState(packed)
      expect(data).toEqual packed
    
  describe 'calcWorldChecksum', ->
    it 'is merely a placeholder for now', ->
      world = {what:'ever'}
      checksum = @subject.calcWorldChecksum(world)
      expect(checksum).toEqual 'temporary world checksum'

  
  
