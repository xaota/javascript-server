#!/usr/bin/env node --max_old_space_size=1024
"use strict";

/** @section exports */
/** Обработчик события завершения скрипта @pipeline @node
  * @param {function} handler @sync запуск при завершении
  */
  export default function(handler) {
    process.on('SIGHUP',  exit('SIGHUP'));
    process.on('SIGINT',  exit('SIGINT'));
    process.on('SIGQUIT', exit('SIGQUIT'));
    process.on('SIGABRT', exit('SIGABRT'));
    process.on('SIGTERM', exit('SIGTERM'));

  /** Перехват события завершения скрипта
    * @param {string} type тип события завершения
    * @return {function} запуск внешнего обработчиика
    */
    function exit(type) {
      return function() {
        handler(type);
        process.exit()
      }
    }
  }
