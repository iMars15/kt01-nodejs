const fs = require('node:fs');
const path = require('node:path');

const config = require('./config');
const { readCsv } = require('./utils/csv');

async function main() {

  try {
    await fs.promises.access(config.inputFile, fs.constants.R_OK);
  } catch {
    console.error(
      `Ошибка: входной файл не найден или недоступен для чтения: ${config.inputFile}`
    );
    process.exitCode = 1;
    return;
  }

  const outputDir = path.dirname(config.outputFile);
  await fs.promises.mkdir(outputDir, { recursive: true });

  const output = fs.createWriteStream(config.outputFile, {
    encoding: 'utf8',
  });

  let processed = 0;
  let filtered = 0;
  let headerWritten = false;

  output.on('error', (error) => {
    console.error(`Ошибка записи файла: ${error.message}`);
    process.exitCode = 1;
  });

  try {
    await readCsv(
      config.inputFile,

      (row) => {
        processed++;

        const age = Number(row.age);
        const cityMatches = row.city === config.cityFilter;
        const ageMatches = age >= config.minAge;

        if (ageMatches && cityMatches) {
          filtered++;

          const line = [
            row.id,
            row.name,
            row.age,
            row.city,
          ].join(',');

          output.write(`${line}\n`);
        }
      },

      (header) => {
        if (!headerWritten) {
          output.write(`${header.join(',')}\n`);
          headerWritten = true;
        }
      }
    );

    await new Promise((resolve, reject) => {
      output.end(resolve);
      output.on('error', reject);
    });

    console.log(`Обработано строк: ${processed}`);
    console.log(`Прошло фильтр: ${filtered}`);
    console.log(`Результат записан в: ${config.outputFile}`);
  } catch (error) {
    output.destroy();

    if (error.code === 'ENOENT') {
      console.error(
        `Ошибка: входной файл не найден: ${config.inputFile}`
      );
    } else {
      console.error(`Ошибка обработки CSV: ${error.message}`);
    }

    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Критическая ошибка: ${error.message}`);
  process.exitCode = 1;
});