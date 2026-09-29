const fs = require('node:fs');
const readline = require('node:readline');

/**
 *
 *
 * @param {string} filePath
 * @param {(row: object) => void} onRow
 * @param {(header: string[]) => void} onHeader
 * @returns {Promise<void>}
 */
function readCsv(filePath, onRow, onHeader) {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(filePath, {
      encoding: 'utf8',
    });

    input.on('error', reject);

    const rl = readline.createInterface({
      input,
      crlfDelay: Infinity,
    });

    let header = null;

    rl.on('line', (line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        return;
      }

      const values = trimmedLine.split(',');

      if (!header) {
        header = values;
        onHeader(header);
        return;
      }

      const row = {};

      header.forEach((column, index) => {
        row[column] = values[index] ?? '';
      });

      onRow(row);
    });

    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

module.exports = {
  readCsv,
};