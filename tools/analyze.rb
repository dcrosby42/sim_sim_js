require 'yaml'
require 'set'

# file="dater.txt"
file="dater5.txt"

data = File.readlines(file).map do |line|
  if line =~ /TurnFinished\|(.*?)\|(\d+)\|(.*?)\s*\z/
    player_id = $1
    turn_number = $2
    crc = $3
    [ player_id, turn_number, crc ]
  else
    nil
  end
end.reject do |x| 
  x.nil? 
end

turns ={}
data.each do |id,turn,chk|
  t = turns[turn]
  if !t
    # t = {turn:turn}
    t = {}
    turns[turn] = t
  end
  t[id] = chk
end

agreements = 0
disagreements = 0

turns.each do |turn,x|
  if x.keys.length > 1
    puts "#{turn} #{x.inspect}"
    s = Set.new(x.values)
    if s.size == 1
      agreements += 1
    else 
      disagreements += 1
    end
  end
end


puts "Agreements: #{agreements}"
puts "Disagreements: #{disagreements}"







