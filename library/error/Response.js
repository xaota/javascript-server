import ServerError from './Server.js';

/** {ResponseError} Ошибки ответа @class
  *
  */
  export default class ResponseError extends ServerError {
  /** {ResponseError} @constructor
    * @param {text} message сообщение об ошибке
    */
    constructor(message, ...args) {
      super(message, ...args);
      this.type.push('response');
      console.log(this.type, message, args);
    }
  }
