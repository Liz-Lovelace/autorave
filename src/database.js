import { Sequelize, DataTypes } from 'sequelize';
import { getPath } from './utils.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: getPath('./music/database.db'),
  logging: false,
});

export const Track = sequelize.define('Track', {
  uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ext: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  album: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  length: {
    type: DataTypes.REAL,
    allowNull: false,
  },
  extractor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  track_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  download_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  times_listened: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});
// await sequelize.sync({alter: true}); // uncomment to migrate!

export async function isDuplicate(track) {
  return Boolean(await Track.findOne({ where: { track_url: track.track_url } }));
}

export async function isInProgress() {
  return Boolean(await Track.findOne({ where: { download_status: 'in progress' } }));
}

