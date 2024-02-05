import { Track } from './database.js';
import YTDLP from 'yt-dlp-wrap';
import { getPath } from './utils.js';
import uuidGenerator from 'short-uuid';
import { isDuplicate, isInProgress } from './database.js';

const YTDlpWrap = YTDLP.default;
const YTDlpPath = getPath('./yt-dlp');
/*
// UNCOMMENT THIS TO DOWNLOAD THE LATEST YT-DLP BINARY
// todo: this should really like, conditionally download it only if it's not already in the path
let githubReleasesData = await YTDlpWrap.getGithubReleases(1, 5);
await YTDlpWrap.downloadFromGithub(
    YTDlpPath
);
*/
const downloader = new YTDlpWrap(YTDlpPath);

export async function downloadTracks() {
  if (await isInProgress()) {
    console.log('download not started: another download is already in progress');
    return;
  }

  let tracks = await Track.findAll({
    where: { download_status: 'awaiting download' },
  });

  for (let track of tracks) {
    await track.update({ download_status: 'in progress' });
    // todo: if this freezes we're fucked
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

export async function addToDownloadQueue(url) {
  let tracks = await fetchTracksMetadata(url);
  for (let track of tracks) {
    if (await isDuplicate(track)) {
      console.log(`track already exists, skipping ${track.title}`);
      continue;
    }
    await track.save();
    console.log(`added track to queue: ${track.title}`);
  }
}

async function fetchTracksMetadata(url) {
  let metadata = await downloader.getVideoInfo(url);
  console.log('\ndownloaded metadata');
  metadata = Array.isArray(metadata) ? metadata : [metadata];
  return metadata.map(metadataToTrack);
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
    download_status: 'awaiting download',
  });
}

function assertProperty(metadata, property) {
  if (metadata[property] !== undefined) {
    return metadata[property];
  }
  else {
    throw new Error(`track property "${property} is undefined! (${metadata.title} ${metadata.original_url})`);
  }
}
