import express from 'express';
import fs from 'fs/promises';
import moment from 'moment';
import { Track } from './database.js';
import { getPath, explainError } from './utils.js';
import { DJ } from './dj.js';
import { addToDownloadQueue, downloadTracks } from './downloader.js';

export function registerEndpoints(app, templates) {
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.use('/static', express.static(getPath('/static')));
  app.use('/track', express.static(getPath('/music')));

  app.get('/', endpoint(async() => {
    return templates['page-wrapper']({
      title: 'autorave',
      body: templates['index-page'](),
    });
  }));

  app.get('/tracks', endpoint(async() => {
    return templates['page-wrapper']({
      title: 'trax manager',
      body: templates['tracks-page'](),
    });
  }));

  app.get('/playlist', endpoint(async() => {
    const tracks = await Track.findAll({
      where: { download_status: 'downloaded' },
    });
    return DJ.playlist(tracks);
  }));

  app.post('/download-tracks', endpoint(async(req) => {
    const { url } = req.body;
    // todo: if this rejects, it crashes and burns very painfully indeed
    addToDownloadQueue(url).then(() => downloadTracks());
    return 'added to queue, please wait for a bit for the queue to update';
  }));

  app.get('/track-queue', endpoint(async() => {
    // todo: here in the template we can add functionality for deleting and restarting downloads
    const tracks = await Track.findAll({
      order: [['createdAt', 'DESC']],
    });

    const orderedTracks = [];

    ['error', 'in progress', 'awaiting download', 'downloaded'].forEach(status => {
      const filteredTracks = tracks.filter(track => track.download_status === status).map(track => track.toJSON());
      orderedTracks.push(...filteredTracks);
    });

    return templates['track-queue']({ orderedTracks });
  }));

  app.get('/rating-controls', endpoint(async(req) => {
    const { uuid, action } = req.query;
    let track = await Track.findByPk(uuid);
    if (action === 'upvote') {
      track.upvotes += 1;
    }
    else if (action === 'downvote' && track.upvotes > 0) {
      track.upvotes -= 1;
    }
    else if (action === 'delete') {
      return templates['delete-dialog']({ uuid: track.uuid });
    }
    await track.save();
    return templates['rating-controls']({ upvotes: track.upvotes });
  }));

  app.post('/listened', endpoint(async(req) => {
    const track = await Track.findByPk(req.body.uuid);
    track.times_listened += 1;
    await track.save();
    return { status: 'success' };
  }));

  app.delete('/track', endpoint(async(req) => {
    const uuid = req.body.uuid;
    const track = await Track.findByPk(uuid);
    if (!track) {
      return { status: 'error' };
    }
    const filePath = getPath(`./music/${track.uuid}.${track.ext}`);
    await fs.unlink(filePath);
    await track.destroy();
    return { status: 'success' };
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
