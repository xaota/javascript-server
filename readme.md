# javascript-server

> `@node12`, `@es-module`


## установка / instalation
```bash
$ npm install javascript-server
```

- [x] `Server` - сервинг / static, dynamic
- [x] `Router` - роутинг
- [x] `Api`    - api-config
- [ ] `Socket` - WebSocket server


## настройка и использование / setting and usage
> `router.js` - роутинг
```javascript
import {Router} from 'javascript-server';

export default new Router()
  .htdocs('/path/to/htdocs') // wwwroot folder
  .static('/libraries', {    // other folders for static libs, dependencies, etc
    '/components': '/',
    '/static'    : '/'
  })
  .errors('/errors', {       // folder for http error pages
    '404': '/path/to/404.html'
    // ...
  })
  .api({                     // path for api requests
    method: ['post'],
    path: '/api'
  })
                             // dynamic routing
  .get('/regex',  request => { ... })
  .post('/regex', request => { ... });
```
---

> `api.js` - config api
```javascript
import {Api} from 'javascript-server';

export default new Api({type: 'json'})
  .required('version', data => data.version, '0.1.0')
  .required('method',  data => data.method && data.method.split('.'))
  // .error(error => error);
  .before(api.check('version'), api.check('method'))
  .init('0.1.0', {
    friends: {
      get: data => {},
      set: data => {}
    }
  });
  // .after(data => data)
```
---

> `index.js` - server
```javascript
import {Server} from 'javascript-server';
import router   from './router.js';
import api      from './api.js';

const server = Server.http({host: 'localhost', port: 8080});

server
  .router(router)
  .api(api)
  .on('start', server => console.log(`started on port ${server.config.port}`)
  .start();
```
---

## features


## todo / roadmap
