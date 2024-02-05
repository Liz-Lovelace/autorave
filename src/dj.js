export class DJ {
  static playlist(tracks) {
    tracks.forEach(track => {
      track.weight = this.determineWeight(track);
      track.dataValues.weight = track.weight;
    });
    const filteredTracks = tracks.filter(track => track.weight !== 0);
    return this.mixTracks(filteredTracks);
  }

  static mixTracks(tracks) {
    const totalWeight = tracks.reduce((sum, track) => sum + track.weight, 0);
    tracks.forEach(track => {
      track.randomizedPriority = Math.pow(Math.random(), totalWeight / track.weight);
    });
    return tracks.sort((a, b) => b.randomizedPriority - a.randomizedPriority);
  }

  static determineWeight(track) {
    let weight = 1;

    if (track.length >= 480) {
      weight *= (480.0 / track.length);
    }

    if (track.upvotes > 0) {
      weight *= track.upvotes;
    }
    else {
      weight *= Math.pow(0.8, track.times_listened);
    }

    return weight;
  }
}

