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
    #handler = () => {}

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
      const query = Object.assign(this.config.default, data.query);
      const result = this.#handler(this, query, data.body);
      response.write(JSON.stringify(result));
    }

  /** */
    call(version, controller, data) {
      const controllers = this.#version[version];
      controller = Obj.get(controllers, controller, '.');
      return controller(data);
    }

  }
