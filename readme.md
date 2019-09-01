# javascript-server
Cервер для node12

## установка / instalation
```shell
$ npm install javascript-server
```

- [x] `Server` - сервинг / static, dynamic
- [x] `Router` - роутинг
- [x] `Api`    - api (`http post` only)
- [ ] `Socket` - WebSocket server

## настройка и использование / setting and usage
вам понадобится `проект для node12` (es-module)

```
/api
  index.js
  controllers.js

/service
  ...

/htdocs
  index.html

/libraries
  ...

index.js
router.js
package.json
```

> `package.json` - для node12 проект должен иметь тип `module`
```json
{
  "type": "module",
  "scripts": {
    "start": "node --experimental-modules index.js"
  },
  ...
}
```
---

> `api/index.js` - config api
```javascript
import {Api}       from 'javascript-server';
import controllers from './api/controllers.js';

const config = {
  method  : 'post',
  type   : 'application/json',
  route  : '/api',
  require: ['version', 'method'], // http query params
  default: {
    version: '1.0.0'
  }
};

export default new Api(config).version('1.0.0', controllers);

// также можно изменить обработчик выбора метода апи для обработки запроса
// например,
// .handler((api, request, data) => api.call(request.version, request.method, data));
```


> `api/controllers.js` - список контроллеров api
```javascript
import usersInfoService from '../service/usersInfoService.js';
import friendsInfoService from '../service/friendsInfoService.js';

export default {
  debug: { // тестовый раздел для проверки
    api: {
      test: ({a, b}) => a + b
    }
  },
  users: {
    all: () => usersInfoService.allUsersList(),
    get: ({id}) => usersInfoService.fromId(id),
    ...
  },
  friends: {
    get: ({id}) => friendsInfoService.fromId(id),
    add: ({id, user}) => friendsInfoService.follow(id, user),
    remove: (id, user) => friendsInfoService.unfollow(id, user),
    ...
  },
  ...
}
```
> В папке `services` нужно создать сервисы (`usersInfoService` и `friendsInfoService`) или закоментировать строки про них
---

> `router.js` - роутинг
```javascript
import {Router} from 'javascript-server';

export default new Router()
                                      // static routing
  .htdocs('/htdocs')                  // wwwroot folder
  .static('/libraries', {             // other folders for static libs, dependencies, etc
    '/components': '/components',
    '/static'    : '/static'
  })
                                      // dynamic routing (?)
  .get('/regex',  request => { ... })
  .post('/regex', request => { ... });
```
---

> `index.js` - server
```javascript
import {Server} from 'javascript-server';
import router   from './router.js';
import api      from './api/index.js';

const server = Server.http({host: 'localhost', port: 8080});
server
  .router(router)
  .api(api)
  .on('start', server => console.log(`server started on ${server.config.port}`)
  .start();
```
---

### запуск
```shell
$ npm start
```

### проверка
> `http://localhost:8080` - открыть в браузере

содержимое файла `/htdocs/index.html`
> `инструменты разработчика -> console` - вызовем метод `debug.api.test`

```javascript
const request = '/api?debug.api.test';
// также можно /api?method=debug.api.test

await fetch(request, {
  method: 'post',
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  },
  body: JSON.stringify({
    a: 3,
    b: 4
  })
})
  .then(response => response.text())
```
сумма чисел `a` и `b`

> P.S. Можно, например, фронте использовать пакет [javascript-fetch-api](https://www.npmjs.com/package/javascript-fetch-api) для подобных запросов

## features


## todo / roadmap
