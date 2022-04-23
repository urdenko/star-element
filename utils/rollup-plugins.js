/**
 * У Rollup комьюнити много плагинов, но некоторые из них могут делать не то что ожидаешь.
 * Проще написать свой плагин, чем копаться в авторских поделках
 */

import { createFilter } from '@rollup/pluginutils';

/**
 * Берем контент любого файла и оборачиваем его в ES модуль
 * теперь любой файл доступен в JS как строка.
 * Это то, что мы обещали TS в файле assets.d.ts
 */
export const wrapFileToEsModule = (opts = {}) => {
  if (!opts.include) {
    throw Error('include option should be specified');
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'wrapFileToEsModule',

    transform(code, id) {
      if (filter(id)) {
        return {
          code: `export default ${JSON.stringify(code.replace(/\n/g, '').replace(/\r/g, ''))};`,
          map: { mappings: '' },
        };
      }
    },
  };
};

/** просто убрать двойные пробелы и все переносы */
export const reduceSpaces = (opts = {}) => {
  if (!opts.include) {
    throw Error('include option should be specified');
  }

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'reduceSpaces',

    transform(code, id) {
      if (filter(id)) {
        return {
          code: code.replace(/^\s+/gm, '').replace(/(\r\n|\n|\r)/gm, ''),
          map: { mappings: '' },
        };
      }
    },
  };
};
