import http from 'http';
import Router from './Router.js';
import Parser from './Parser.js';
import {ResponseError} from './error/index.js';

/** {Server} Объект сервера @class
  *
  */
  export default class Server {
  /** {Server} @constructor
    * @param {object} config настройки сервера
    */
    constructor(config = {}) {
      this.config = Object.assign(getDefaultServerConfig(), config);
    }

  /** #router */
    #router = null

  /** #event */
    #event = {}

  /** #logger */
    #logger = null;

  /** #get */
    #get = []

  /** #post */
    #post = []

  /** / init
    * @param {http?} server сервер
    */
    init(server) {
      this.server = server;
      return this;
    }

  /** / router */
    router(router) {
      this.#router = router;
      return this;
    }

  /** / api */
    api(api) {
      // TODO: memo
      if (this.#router !== null) this.#router.api(api);
      return this;
    }

  /** / on */
    on(event, listener) {
      this.#event[event] = listener;
      return this;
    }

  /** / handle */
    handle(request, response) {
      const data = {
        ...Router.parse(request),
        method: Router.method(request)
      };

      this.event('prepare', data);
      try {
        Server[data.method].call(this, request, response, data);
      } catch (error) {
        this.error(request, response, error);
      }
    }

  /** / start */
    start() {
      this.server.listen(this.config.port, this.config.host);
      this.event('start');
      return this;
    }

  /** / stop */
    stop(signal) {
      // TODO: stop server!
      // this.server.close();
      this.event('stop', signal);
      return this;
    }

  /** */
    get(callback) {
      this.#get.push(callback);
      return this;
    }

  /** */
    post(callback) {
      this.#post.push(callback);
      return this;
    }

  /** / error */
    error(request, response, error) {
      this.event('error', error);
      console.error(error);
      return this;
    }

  /** / event */
    event(name, ...args) {
      const events = this.#event;
      if (this.#logger) this.#logger.log(name, ...args);
      if (name in events) events[name](this, ...args);
      return this;
    }

  /** / logger */
    logger(logger) {
      this.#logger = logger;
      return this;
    }

  /** Создание HTTP сервера / http @static
    * @param {object} config параметры сервера
    * @return {Server} server
    */
    static http(config) {
      const server = new Server(config);
      const initer = new http.Server(listener.bind(server));
      return server.init(initer);
    }

  /** */
    static https(config) {
      // TODO: https.server
    }

  /** */
    static http2(config) {
      // TODO: http2.server
    }

  // #region [Behavior]
  /** */
    static get(request, response, data) {
      this.event('get');
      this.reply(request, response, data, this.#get);
    }

  /** */
    static post(request, response, data) {
      this.event('post');
      const buffers = [];
      request.on('data', chunk => buffers.push(chunk));
      request.on('end', _ => {
        // this.event('post.end');
        try {
          const body = new Parser(buffers);
          data.body = body.parse(request.headers['content-type']);
        } catch (error) {
          this.error(request, response, error);
          return response.end(error.message); // !
        }
        this.reply(request, response, data, this.#post);
      });
    }

  /** / reply */
    async reply(request, response, data, handlers) {
      // this.event(data.method + '.reply');
      // todo: this.api
      const router = this.#router;
      const routed = router && router.find(data);
      try {
        router && routed !== false
        ? await router.exec(routed, data, request, response)
        : handlers.forEach((handler, index) => { // TODO: Promise waterflow
          try {
            handler.call(this, request, response, data, index)
          } catch (error) {
            const temp = new ResponseError('ошибка при подготовке ответа: ' + error.message);
            this.error(request, response, temp);
            return response.end(temp.message); // !
          }
        });
      } catch (err2) {
        const temp = new ResponseError('ошибка при подготовке ответа: ' + err2.message);
        this.error(request, response, temp);
        return response.end(temp.message); // !
      }
      this.event('response.' + data.method);
      if (!response.finished) response.end();
      // return this;
    }
  // #endregion
  }

// #region [Private]
/** / listener
  * @param {?} request запрос
  * @param {?} response ответ
  * @this {Server} server
  */
  function listener(request, response) {
    this.event('handle');
    try {
      this.handle(request, response);
    } catch (error) {
      this.error(request, response, error);
    }
  }

/** */
  function getDefaultServerConfig(host = 'localhost', port = 80) {
    return {host, port};
  }
// #endregion
