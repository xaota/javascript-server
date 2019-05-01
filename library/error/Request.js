import ServerError from './Server.js';

/** {RequestError} Ошибки запросов @class
  *
  */
  export default class RequestError extends ServerError {
  /** {RequestError} @constructor
    * @param {text} message сообщение об ошибке
    */
    constructor(message, ...args) {
      super(message, ...args);
      this.type.push('request');
      console.log(this.type, message, args);
    }
  }
