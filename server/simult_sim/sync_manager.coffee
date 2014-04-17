class SyncManager
  constructor: ->
    @_debugOn = true

    @sums = {}
    @count = 0
    @max = 0
    @minorConsensus = null
    @defaultProviderCrc = null

  turnEnded: (@turnNumber) ->
    @sums = {}
    @count = 0
    @max = 0
    @minorConsensus = null
    @defaultProviderCrc = null

  gotChecksum: ({playerId, turnNumber, checksum, clientIds, defaultProviderId,resync}) ->
    return null if clientIds.length <= 1 # no relevance until more than 1 player
    if turnNumber == @turnNumber
      @count += 1
      bros = @sums[checksum]
      unless bros
        bros = []
        @sums[checksum] = bros

      bros.push playerId
      if bros.length > @max
        @max = bros.length
      if bros.length > 1
        @minorConsensus = checksum

      if playerId == defaultProviderId
        @defaultProviderCrc = checksum

    else
      # TODO: this actually happens pretty often, do something smarter
      console.log "WAT? SyncManager got checksum for turn #{turnNumber} while expected to hear about turn #{@turnNumber}"
      return null

    if @count == clientIds.length # All reporting
      if @max == @count
        # all checksums agree, no action needed
        return null
      else
        # someone(s) is out of sync
        providerId = defaultProviderId
        if @minorConsensus != null
          # There are at least two other players who report same checksum.
          # Select one of them as state provider.
          providerId = @sums[@minorConsensus][0]
        # For everyone else, reset their gamestate based on the selected authority
        for crc,playerIds of @sums
          if crc != @minorConsensus
            for errantId in playerIds
              if errantId != providerId
                authorityLabel = "the default provider's"
                authorityChecksum = @defaultProviderCrc
                if @minorConsensus
                  authorityLabel = "the minority consensus"
                  authorityChecksum = @minorConsensus
                @_debug "Requesting gamestate be sent from #{providerId} -> to -> #{errantId} because his crc #{crc} didn't match #{authorityLabel} crc #{authorityChecksum}", @sums
                resync(providerId, errantId)
  _debug: (args...) ->
    console.log ">>> [SyncManager]", args... if @_debugOn

module.exports = SyncManager
