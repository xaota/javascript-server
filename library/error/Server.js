/** {ServerError} Ошибки сервера @class
  *
  */
export default class ServerError extends Error {
  /** {ServerError} @constructor
    * @param {text} message сообщение об ошибке
    */
    constructor(message, ...args) {
      super(message, ...args);
      this.type = ['server'];
      console.log(this.type, message, args);
    }
  }
