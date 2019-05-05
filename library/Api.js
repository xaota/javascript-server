import {Obj} from 'javascript-std-lib/index.js';

/** {Api} конструктор Api @class
  *
  */
  export default class Api {
  /** {Api} @constructor
    * @param {object} config параметры
    */
    constructor(config) {
      this.config = config;
    }

  /** */
    #handler = defaultHandler;

  /** */
    #version = {}

  /** */
    handler(callback) {
      this.#handler = callback;
      return this;
    }

  /** */
    version(name, controllers) {
      this.#version[name] = controllers;
      return this;
    }

  /** */
    handle(request, response, data) {
      const query = {...this.config.default, ...data.query};
      try {
        const result = this.#handler(this, query, data.body);
        response.write(JSON.stringify(result || null));
        // return result;
      } catch (e) {
        response.writeHead(406, {'Content-Type': 'application/json'});
        response.write(e.message);
        response.end();
        // throw e;
      }
    }

  /** */
    call(version, method, data) {
      const controllers = this.#version[version];
      const controller = Obj.get(controllers, method, '.');
      if (controller !== undefined) return controller(data);
      this.error(version, method, data);
    }

  /** */
    error(version, method, data) {
      this; // todo!
      const info = {
        error: true,
        message: 'no controller',
        version,
        method,
        data
      };
      throw new Error(JSON.stringify(info));
    }

  }

// #region [Private]
/** */
function defaultHandler(api, request, data) {
  const keys   = Object.keys(api.config.default);
  const method = Object.keys(request).filter(e => !keys.includes(e))[0] || request.method;
  return api.call(request.version, method, data);
}
// #endregion
