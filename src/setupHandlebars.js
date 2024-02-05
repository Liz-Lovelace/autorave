import Handlebars from 'handlebars';
import fs from 'fs/promises';
import { getPath } from './utils.js';

const templatesDir = '/templates';

export default async function SetupHandlebars() {
  const templates = {};

  const templateFiles = await fs.readdir(getPath(templatesDir));
  for (const file of templateFiles) {
    if (file.endsWith('.hbs')) {
      const filePath = getPath(`${templatesDir}/${file}`);
      const templateString = await fs.readFile(filePath, 'utf8');
      Handlebars.registerPartial(file.split('.')[0], templateString);
      templates[file.split('.')[0]] = Handlebars.compile(templateString);
    }
  }

  Handlebars.registerHelper('isZero', function(value, options) {
    if (value === 0) {
      return options.fn(this);
    }
    else if (options.inverse) {
      return options.inverse(this);
    }
    return '';
  });

  return templates;
}
