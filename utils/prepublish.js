/**
 * Зависимости в devDependencies не понадобядся на стороне клиента.
 * Давайте не будем ему их передвать, чтобы не плодить лишний мусор в его node_modules
 */

import { copyFile, writeFile } from 'fs';
import packageJson from '../package.json';

delete packageJson.devDependencies;

copyFile('package.json', 'package.original.json', (err) => {
  if (err) throw err;

  writeFile('package.json', JSON.stringify(packageJson), function (err) {
    if (err) throw err;
  });
});
