import express from 'express';
import { registerEndpoints } from './endpoints.js';
import setupHandlebars from './setupHandlebars.js';

const app = express();

const templates = await setupHandlebars();

registerEndpoints(app, templates);

app.listen(1273, () => {
  console.log('autorave is listening on http://localhost:1273');
});

