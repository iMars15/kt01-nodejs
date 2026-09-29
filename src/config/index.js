const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  inputFile: path.resolve(process.env.INPUT_FILE || ''),
  outputFile: path.resolve(process.env.OUTPUT_FILE || ''),
  minAge: Number(process.env.MIN_AGE),
  cityFilter: process.env.CITY_FILTER || '',
};

if (!process.env.INPUT_FILE) {
  throw new Error('INPUT_FILE не указан в .env');
}

if (!process.env.OUTPUT_FILE) {
  throw new Error('OUTPUT_FILE не указан в .env');
}

if (!Number.isFinite(config.minAge)) {
  throw new Error('MIN_AGE должен быть числом');
}

if (!config.cityFilter) {
  throw new Error('CITY_FILTER не указан в .env');
}

module.exports = config;