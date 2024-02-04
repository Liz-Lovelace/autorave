import path from 'path';
import { fileURLToPath } from 'url';

export function explainError(error) {
  console.error('error in an endpoint:');
  console.error(error);
  let errorDescription = `<code>${error.name}: ${error.message}<br>`;

  if (error.stack) {
    const stackLine = error.stack.split('\n')[1].trim();
    const match = stackLine.match(/at .+ \((?:.+\/)*(.+?):(\d+):(\d+)\)$/);
    if (match) {
      errorDescription += `at ${match[1]}:${match[2]}<br>`;
    }
  }

  errorDescription += '<br> also: <br>';

  Object.keys(error).forEach(key => {
    if (key !== 'name' && key !== 'message' && key !== 'stack') {
      errorDescription += `${key}: ${error[key]}<br>`;
    }
  });

  errorDescription += '</code>';

  return errorDescription;
}

export function getPath(relativePath) {
  const baseDir = fileURLToPath(new URL('..', import.meta.url));
  return path.join(baseDir, relativePath);
}

