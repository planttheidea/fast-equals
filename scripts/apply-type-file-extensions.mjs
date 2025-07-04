import glob from 'fast-glob';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const IMPORT_STATEMENT_REGEXP =
  /import([ \n\t]*(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/g;

const EXPORT_STATEMENT_REGEXP =
  /export([ \n\t]*(?:[^ \n\t\{\}]+[ \n\t]*,?)?(?:[ \n\t]*\{(?:[ \n\t]*[^ \n\t"'\{\}]+[ \n\t]*,?)+\})?[ \n\t]*)from[ \n\t]*(['"])([^'"\n]+)(?:['"])/g;

const BASE_FILEPATH = join(import.meta.dirname, '..', 'dist');

const files = glob.sync(join(BASE_FILEPATH, '*', 'types', '*.d.ts'));

function getReplacement(type, extensionPrefix) {
  return function (_line, dependencies, _quoteType, location) {
    return `${type}${dependencies}from '${location}.d.${extensionPrefix}ts'`;
  };
}

function getReplacedContents(contents, extensionPrefix) {
  return contents
    .replaceAll(IMPORT_STATEMENT_REGEXP, getReplacement('import', extensionPrefix))
    .replaceAll(EXPORT_STATEMENT_REGEXP, getReplacement('export', extensionPrefix));
}

function getTypeFilePrefix(file) {
  const relativePath = file.replace(`${BASE_FILEPATH}/`, '');
  const initialFolder = relativePath.split('/')[0];

  switch (initialFolder) {
    case 'esm':
      return 'm';

    case 'cjs':
      return 'c';

    default:
      return '';
  }
}

for (const file of files) {
  const contents = readFileSync(file, 'utf-8');
  const extensionPrefix = getTypeFilePrefix(file);
  const outputFile = extensionPrefix ? file.replace(/\.d\.ts$/, `.d.${extensionPrefix}ts`) : file;

  writeFileSync(outputFile, getReplacedContents(contents, extensionPrefix), 'utf-8');

  if (outputFile !== file) {
    rmSync(file, { force: true });
  }
}
