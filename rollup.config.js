import typeScript from '@rollup/plugin-typescript';
import { wrapFileToEsModule, reduceSpaces } from './utils/rollup-plugins';
import scss from 'rollup-plugin-scss';
import cleanup from 'rollup-plugin-cleanup';

export default [
  /** "перевариваем" наш src, компилим что компилится, оборачиваем что оборачивается */
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.js', format: 'es' }],
    plugins: [
      scss({
        output: false,
        outputStyle: 'compressed',
      }),
      typeScript({ tsconfig: './tsconfig.json' }),
      wrapFileToEsModule({
        include: '**/*.html',
      }),
    ],
  },

  /** секция ниже протсто наводит марафет, убирает комменты и лишнее простарнство */
  {
    input: './dist/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'es',
      },
    ],
    plugins: [
      cleanup({ comments: 'none', maxEmptyLines: 0 }),
      reduceSpaces({
        include: '**/*.js',
      }),
    ],
  },
];
