import express from 'express';
import { Track } from './database.js';
import { getPath } from './utils.js';
import { explainError } from './utils.js';
import moment from 'moment';
import { DJ } from './dj.js';

export function registerEndpoints(app, templates) {
  app.use(express.urlencoded({ extended: true }));
  app.use('/static', express.static(getPath('/static')));

  app.get('/', endpoint(async() => {
    return templates['page']({
      title: 'autorave',
      body: templates['index']()
    });
  }));

  app.get('/tracks', endpoint(async() => {
    return templates['page']({
      title: 'trax manager',
      body: templates['tracks-page']()
    });
  }));

  /*
  app.get('/playlist', endpoint(async(req) => {
    const tracks = await Track.findAll({
      where: {
        deleted: false
      }
    });
    const playlist = DJ.playlist(tracks);
    return playlist;
  }));
  */

  app.get('/track-queue', endpoint(async () => {
    // todo: here in the template we can add functionality for deleting and restarting downloads
    const tracks = await Track.findAll({
      order: [['createdAt', 'DESC']]
    });

    const orderedTracks = [];

    ['error', 'in progress', 'awaiting download', 'downloaded'].forEach(status => {
      const filteredTracks = tracks.filter(track => track.download_status === status).map(track => track.toJSON());
      orderedTracks.push(...filteredTracks);
    });

    return templates['track-queue']({ orderedTracks });
  }));


}

function endpoint(fn) {
  return async function(req, res) {
    try {
      const output = await fn.apply(this, [req]);

      if (output.file) {
        res.sendFile(output.file);
      }
      else if (output.redirect) {
        res.redirect(output.redirect);
      }
      else {
        res.send(output);
      }

    }
    catch (err) {
      res.status(500);
      res.send(explainError(err));
    }
  };
}
