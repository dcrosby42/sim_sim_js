
Number.prototype.fixed = () ->
  Math.round( this * 1000 ) / 1000

Number.prototype.fixedN = (n) ->
  mult = Math.pow(10,n)
  Math.round( this * mult ) / mult
