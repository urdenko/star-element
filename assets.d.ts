/**
 * Обещаем TS, что указанные файлы это JS модули экспортирущие обычную строку.
 * Обещание будет реализованно при компиляции ручным плагином Rollup
 */

declare module '*.html' {
  const string: string;
  export default string;
}

declare module '*.scss' {
  const string: string;
  export default string;
}
