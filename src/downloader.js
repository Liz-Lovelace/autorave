import { Track } from './database.js'
import YTDLP from 'yt-dlp-wrap'
import { getPath } from './utils.js'
import uuidGenerator from 'short-uuid';

import { isDuplicate } from './database.js';

const YTDlpWrap = YTDLP.default
const YTDlpPath = getPath('./yt-dlp')
/*
// UNCOMMENT THIS TO DOWNLOAD THE LATEST YT-DLP BINARY

// todo: this should really like, conditionally download it only if it's not already in the path
let githubReleasesData = await YTDlpWrap.getGithubReleases(1, 5);

await YTDlpWrap.downloadFromGithub(
    YTDlpPath
);
*/
const downloader = new YTDlpWrap(YTDlpPath);

// downloadTracks('https://patriciataxxon.bandcamp.com/album/agnes-hilda')
// addToDownloadQueue('https://toyoyonoine.bandcamp.com/album/negi-assort')
downloadTracks();
// downloadTracks('https://toyoyonoine.bandcamp.com/track/ff-nnddeerr-2')
// addToDownloadQueue('https://www.youtube.com/watch?v=c4KNd0Yv6d0&pp=ygULcGVuaXMgbXVzaWM%3D')

export async function addToDownloadQueue(url) {
  let tracks = await fetchTracksMetadata(url);
  for (let track of tracks) {
    if (await isDuplicate(track)) {
      console.log(`track already exists, skipping ${track.title}`);
      continue;
    }
    await track.save()
    console.log(`added track to queue: ${track.title}`);
  }
}

async function fetchTracksMetadata(url) {
  let metadata = await downloader.getVideoInfo(url);
  console.log('\ndownloaded metadata')

  metadata = Array.isArray(metadata) ? metadata : [metadata]

  return metadata.map(metadataToTrack)
}

export async function downloadTracks() {
  let tracks = await Track.findAll({
    where: { download_status: 'awaiting download' }
  });
  for (let track of tracks) {
    await track.update({ download_status: 'in progress' });
    await downloadTrack(getPath(`./music/${track.uuid}.${track.ext}`), track.track_url);
    // todo: try-catch and set to `error`
    await track.update({ download_status: 'downloaded' });
    console.log(`downloaded ${track.title}`);
  }
}

async function downloadTrack(outputPath, trackURL) {
  await downloader.execPromise([
    trackURL,
    '--extract-audio',
    '--audio-format',
    'mp3',
    '-o',
    outputPath,
  ]);
}

function metadataToTrack(md) {
  return Track.build({
    uuid: uuidGenerator.generate(),
    title: md.track || assertProperty(md, 'title'),
    // ext is hard-coded into the downloader
    ext: 'mp3',
    album: md.album || null,
    length: assertProperty(md, 'duration'),
    extractor: md.extractor || 'unknown extractor',
    track_url: assertProperty(md, 'original_url'),
    image_url: md.thumbnail || null,
    download_status: "awaiting download",
  });
}

function assertProperty(metadata, property) {
  if (metadata[property] !== undefined) {
    return metadata[property]
  } else {
    throw new Error(`track property "${property} is undefined! (${metadata.title} ${metadata.original_url})`)
  }
}
