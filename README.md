# Khaleesi-JS

### Тут есть баги, они починены в других репозиториях, где используется Khaleesi-JS.
## Использование
Принимает строку, выдаёт строку, переделанную на свой манер.<br>
Может использоваться как модуль для Node.JS, так и например, в фронтенде – для этого просто заменяем `module.exports` на, например, `const Khaleesi`. Никак модулей или доп. скриптов не использует.


```javascript
const Khaleesi = require("./khaleesi.js"); // Подключаем или полностью вставляем код из файла

let phrase = "Кхалиси – худший из ботов на ТЖ";
let remade = Khaleesi(phrase);

return remade;
```

## Credit
Изначально [@pongo](https://github.com/pongo/rapturebot) реализовал как модуль-команду для бота в Telegram.

#### Кхалиси – маленькие сиси
#### Кхяиси – мяенькие сеси
#### Кхяиси – мяеньгие сиси
#### Кхяеси – мяенькее сиси
