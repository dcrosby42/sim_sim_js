
Number.prototype.fixed = (n) ->
  n = n || 3
  parseFloat(this.toFixed(n))
