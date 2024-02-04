export class DJ {
  static playlist(tracks) {
    tracks.forEach(track => {
      track.weight = this.determineWeight(track);
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
    let factors = [];

    // todo: check that this is seconds
    if (track.length >= 480) {
      factors.push(480.0 / track.length);
    }

    if (track.upvotes > 0) {
      factors.push(track.upvotes);
    } else {
      factors.push(Math.pow(0.8, track.times_listened));
    }

    return factors.reduce((acc, val) => acc * val, 1);
  }
}

