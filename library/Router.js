import url, {Url} from 'url';
import fs from 'fs';
import path from 'path';
import {RequestError} from './error/index.js';

const method = ['get', 'post'];

const mime = {
  "html": "text/html",
  "less": "text/css",
  "css" : "text/css",
  "js"  : "application/javascript",
  "mp3" : "audio/mpeg",
  "jpg" : "image/jpeg",
  "jpeg": "image/jpeg",
  "png" : "image/png",
  "gif" : "image/gif",
  "svg" : "image/svg+xml",
  "icon": "image/x-icon",
  // ico
  "xml" : "text/xml",
  "csv" : "text/csv",
  "txt" : "text/plain",
  "md"  : "text/markdown"
};

/** {Router} Настройки маршрутов запросов @class
  *
  */
  export default class Router {
  /** {Router} @constructor
    * @param {object} config настройки роутинга
    */
    constructor(config = {}) {
      this.config = config;
      this.root();
    }

  /** */
    #root = null

  /** */
    #htdocs = null

  /** */
    #static = [];

  /** */
    #api = null

  /** */
    #index = []

  /** */
    exec(filepath, data, request, response) {
      if (filepath === this.#api) return this.controller(request, response, data);

      return new Promise((resolve, reject) => {
        const exist = fs.existsSync(filepath);
        const ext = path.parse(filepath).ext;
        const type = mime[ext.charAt(0) === '.' ? ext.slice(1) : ext];

        // console.log('resolved filepath', filepath, exist, ext, type);

        if (exist && type) {
          const stream = fs.createReadStream(filepath);
          response.writeHead(200, {
            'Content-Type': type,
            'Cache-Control': 'max-age=31536000'
          });
          stream.on('end', resolve);
          stream.pipe(response);
        } else {
          response.writeHead(404, {'Content-Type': 'text/plain'}); // ?
          response.write('404');
          resolve(); // reject?
        }
      });
    }

  /** */
    api(api) {
      this.#api = api;
      return this;
    }

  /** Обработка POST запросов @todo refactoring
    * @param {object} request запрос
    * @param {object} response ответ
    * @param {string} json данные запроса
    */
    post(request, response, json) {
      let data = {};
      const mime = {'Content-Type': 'application/json'};
      try {
        json = JSON.parse(json);
      } catch (error) {
        data = {error: 'incorrect json data'};
        response.writeHead(400, mime);
        response.end(JSON.stringify(data));
        return;
      }

      const path = this.router.path(request).toLowerCase().split('/');
      if (path.length !== 2 || path[0] !== 'api' || !this.allow.includes(path[1])) {
        response.writeHead(405, mime);
        response.end(JSON.stringify({error: 'method not allowed'}));
        return;
      }

      try {
        const method = path[1];
        data = this.api[method](json);
        response.writeHead(200, mime);
      } catch (error) {
        data = {error: data.error || 406}
        response.writeHead(error.code, mime);
      } finally {
        response.end(JSON.stringify(data));
      }
    }

  /** */
    find(data) {
      try {
        const htdocs = path.resolve(...[this.#root, this.#htdocs, ...data.path].filter(e => e));
        if (fs.existsSync(htdocs)) return htdocs;

        const library = this.#static.filter(s => data.href.toLowerCase().indexOf(s.name) === 0).sort((a, b) => b.name.length - a.name.length)[0];
        if (library !== undefined) {
          const relative = data.href.substr(library.name.length);
          const statics = path.resolve(library.path, './' + relative);
          if (fs.existsSync(statics)) return statics;
        }

        if (this.#api !== null) {
          const api = this.#api.config.route.toLowerCase();
          if (data.href.toLowerCase().indexOf(api) === 0) return this.#api;
        }

        return htdocs;
      } catch (error) {
        return false;
      }
    }

  /** */
    controller(request, response, data) {
      const api = this.#api;
      return api.handle(request, response, data);
    }

  /** */
    root(path = './') {
      this.#root = path;
      return this;
    }

  /** */
    htdocs(path) {
      this.#htdocs = path;
      return this;
    }

  /** */
    static(basepath, ...libraries) {
      const statics = [].concat(...libraries.map(folders => mapLibrary(basepath, folders)));
      statics.forEach(e => {
        e.path = this.resolveForStatic(e.path);
        e.name = e.name.toLowerCase();
        // e.name = Router.path(e.name, false);
      });
      this.#static.splice(this.#static.length, 0, ...statics);
      return this;
    }

  /** */
    resolveForStatic(relative) {
      const chunks = [this.#root, relative].filter(e => e);
      return path.resolve(...chunks);
    }

  /** */
    static parse(request) {
      const url = Router.url(request);
      return {
        href:   Router.href(url),
        path:   Router.path(url),
        search: Router.search(url),
        query:  Router.query(url)
      };
    }

  /** */
    static href(request) {
      request = Router.url(request);
      return request.href;
    }

  /** */
    static path(request, index = 'index.html') {
      request = Router.url(request);
      let path = request.pathname;
      if (index && path.slice(-1) === '/') path += index; // `addr/` -> `addr/index.html`
      return path.split('/').slice(1);
    }

  /** */
    static search(request) {
      request = Router.url(request);
      const search = request.search || '';
      return search.charAt(0) === '?'
        ? search.slice(1)
        : search;
    }

  /** */
    static query(request) {
      request = Router.url(request);
      return request.query;
    }

  /** */
    static url(request) {
      return request instanceof Url
        ? request
        : new url.parse(request.url, true);
    }

  /** */
    static method(request) {
      const data = request.method.toLowerCase();
      if (!method.includes(data)) throw new RequestError('неизвестный метод');
      return data;
    }
  }

// #region [Private]
/** */
  function mapLibrary(basepath, folders) {
    if (folders instanceof Array) folders = folders.reduce((result, folder) => Object.assign(result, {[folder]: folder}), {});
    const result = [];
    Object.keys(folders).forEach(name => result.push({name, path: basepath + folders[name]}));
    return result;
  }
// #endregion
