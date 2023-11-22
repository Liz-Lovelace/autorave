require_relative 'database'
db = Database.new

class DJ
  def self.playlist(tracks, length)
    tracks.each { |track| track["weight"] = determine_weight(track) }
    tracks.select { |track| 
      track["weight"] != 0 
    }
    self.mix_tracks(tracks)[...length]
  end

  def self.mix_tracks(tracks)
    totalWeight = tracks.reduce(0) { |sum, track| sum + track["weight"] }
    tracks.each do |track| 
      track["randomizedPriority"] = rand ** (totalWeight / track["weight"])
    end
    return tracks.sort {|a, b| b["randomizedPriority"] <=> a["randomizedPriority"]}
  end

  def self.determine_weight(track)
    return 0 if track["deleted"] == 1

    factors = []

    if track["length"] >= 480 
      factors.push 480 / track["length"]  
    end

    if track["upvotes"] > 0
      factors.push track["upvotes"]
    else
      factors.push 0.8 ** track["times_listened"]
    end

    return factors.reduce(1, :*).to_f 
  end
end
