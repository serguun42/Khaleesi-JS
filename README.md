# Khaleesi-JS

Скрипт для имитирования речи Кхалиси. Работает на JS без сторонних библиотек, поддерживает Typescript (_TS declarations_).

## Использование

Установить через npm – `npm i @serguun42/khaleesi-js`

Можно импортировать и как ESM, и как CommonJS-модуль, в т.ч. в Typescript-проекты:

```javascript
import Khaleesi from "khaleesi-js"; // ESM
const Khaleesi = require("khaleesi-js"); // Или CommonJS

const phrase = "Кхалиси – худший из ботов в мире";
const remade = Khaleesi(phrase);

console.log(remade);
```

## Credit

Изначально [@pongo](https://github.com/pongo/rapturebot) реализовал как модуль-команду для бота в Telegram.

---

-   Кхяиси – хюдфий из ботёв в мийе
-   Кхяиси – хюдший из ботёв в мийе
-   Кхяеси – хюдший из потёв в мийи
