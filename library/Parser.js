import querystring from 'querystring';
import ParseError from './error/Parse.js';

const types = {
  'application/json'                 : 'json',
  'application/x-www-form-urlencoded': 'urlencoded',
  'multipart/form-data'              : 'multipart'
}

/** {Parser} Разбор входных данных @class @static
  *
  */
  export default class Parser {
  /** */
    constructor(chunks) {
      this.raw = Buffer.concat(chunks).toString();
    }

  /** */
    parse(type = 'text/plain') {
      try {
        this.type = type.split(';')[0].toLowerCase();
        this.body = this.raw;
        const content = contentType(this.type);
        return this[content]();
      } catch (error) {
        throw new ParseError('не удалось распарсить тело запроса');
      }
    }

  /** */
    json() {
      const body = this.body || null;
      return JSON.parse(body);
    }

  /** */
    multipart() {
      const body = this.body;
      const boundary = body.substr(0, body.indexOf('\n')); // 0..40
      const name = 'Content-Disposition: form-data; name="';
      return body
        .split(boundary)
        .filter(e => e.length > 2) // @TODO: все кроме последнего
        .map(e => e.trim())
        .map(e => ({
          name: e.substring(name.length, e.indexOf('\n') - 2),
          data: e.split('\n')[2]
        }))
        .reduce((result, {name, data}) => Object.assign(result, {[name]: data}), {});
    }

  /** */
    urlencoded() {
      const body = this.body;
      return querystring.parse(body);
    }
  }

// #region [Private]
/** */
  function contentType(type) {
    return types[type];
  }
// #endregion
