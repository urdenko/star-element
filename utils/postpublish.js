/**
 * Возвращаем devDependencies, нам то они нужны
 */
import { unlink, rename } from 'fs';

unlink('package.json', (err) => {
  if (err) throw err;

  rename('package.original.json', 'package.json', function (err) {
    if (err) throw err;
  });
});
