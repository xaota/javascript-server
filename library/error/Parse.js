import ServerError from './Server.js';

/** {RequestError} Ошибки запросов @class
  *
  */
  export default class ParseError extends ServerError {
  /** {RequestError} @constructor
    * @param {text} message сообщение об ошибке
    */
    constructor(message, ...args) {
      super(message, ...args);
      this.type.push('parse');
      console.log(this.type, message, args);
    }
  }
