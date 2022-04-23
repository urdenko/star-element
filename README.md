# Нативная компонента Star Element
Создана как шпаргалка для разработки и публикации собственных компонент.<br>

## Подключение к проектам
Команда `npm i @urdenko/star-element` подтянет последнюю публикацию с npm репозитория.<br>

Если есть желание поиграться с кодом (отладка), то:
* клонируйте репозиторий на локальный компьютер, выполните команду `npm i`
* выполните команду `npm link` в корне компонента, что бы создать ссылку на папку компоненты
* выполните команду `npm link @urdenko/star-element` в корне своего проекта, что бы примонтировать к нему ссылку на папку компоненты
* выполните команду `npm start` в корне нативной компоненты, что бы сразу видеть изменения в своем проекте

## Использование в проектах
### React
В стартовом index.tsx файле проекта добавьте
```tsx
import { StarElement } from '@urdenko/star-element';
customElements.define('star-element', StarElement);
```
Реакт требует задекларировать компонент с тегом star-element.
Создайте файл declarations.d.ts файл с кодом
```tsx
declare namespace JSX {
    import { StarElement } from '@urdenko/star-element';    
    interface IntrinsicElements {
      "star-element": StarElement;
    }
}
```
Теперь можно работать с элементом в любой react компоненте
```tsx
import { StarElement } from '@urdenko/star-element';
import { useEffect, useRef } from 'react';
import './App.css';

function App() {

  const ref = useRef<StarElement>();

  setTimeout(() => {
    if (ref.current) {
      ref.current.maxStars = 3;
      ref.current.value = 2;
    }    
  }, 7000);

  const listener = (event: Event) => {
    const score = (event as CustomEvent).detail;
    console.log('score:', score);    
  }

  useEffect(() => {
    const star = ref.current;
    star?.addEventListener('scoreSelect', listener);    
    
    return () => {
      star?.removeEventListener('scoreSelect', listener);
    }
  })

  return (
    <div>
      <star-element ref={ref}></star-element>
    </div>
  );
}

export default App;
```

### Angular
В main.ts до загрузки главного модуля
```ts
import { StarElement } from '@urdenko/star-element';
customElements.define('star-element', StarElement);
```
В главном модуле разрешите использовать Custom Elements
```ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
@NgModule({
  ...
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
```
В template Angular компоненты
```html
<star-element [ngDefaultControl] [formControl]="control" [maxStars]="maxStars"></star-element>
```
В классе Angular компоненты
```ts
public control = new FormControl(0);
public maxStars = 7;

ngOnInit(): void {
    this.control.valueChanges.subscribe((value) => {
      console.log('score:', value);      
    })

    setTimeout(() => {
      this.maxStars = 3;
      this.control.setValue(2);
    }, 7000);
}
```
С помощью встроенной директивы \[ngDefaultControl\] angular воспринимает компоненту как \<input\> элемент и теперь ее можно сделать частью Reactive Form, что очень удобно в дальнейшем использовании.

### Кастомизация: 
```css
star-element {  
  font-size: 40px;
  --se-starBgColor: red;
  --se-selectStarBgColor: blue
}
```
font-size задает общую высоту, которую займет элемент. Все внутренние элементы с помощью em единиц подстроятся под эту высоту с сохраненем пропорций.

Css Variables являются основным инструментом подстравивания компоненты под проект.<br>
На случай, если текущего набора недостаточно, нет ничего проще, чем добавить еще один variable в нативную компоненту.<br>
Если вам понадобится управление внутренними элементами из проекта через селекторы - подождите и подумайте еще раз.   
## Публикация
Сначала определитесь с реестром, в котором вы будете хранить релизы своей нативной компоненты:
* public npmjs.com - самый удобный для тех, кто делает open source
* private npmjs.com - самый удобный для тех, кто делает коммерческую или закрытую реализацию
* own hosted - если нет доверия к сторонним сервисам, то подымайте свой реестр из таких продуктов как [Nexus](https://hub.docker.com/r/sonatype/nexus3/)

Публикация происходит командой `npm public`, но чтобы она успешно отработала нужно много чего настроить.
Для отладки публикации я рекомендую использовать `npm public --dry-run`, что бы безопасно отловить все ошибки.
Перед публикацией нужно авторизоваться в реестре: `npm login` или `npm login --registry=ownhosted-registry.com`

Все настройки публикации можно указать в package.json

```jsonc
// здесь имя scope + имя пакета, очень удобно когда есть много связанных пакетов  
"name": "@urdenko/star-element",

// перед каждой публикацией версию нужно сддвигать
"version": "1.0.0",

// мы говорим "declaration": true, "declarationDir": "./dts" внутри tsconfig.json
// здесь мы указываем где найти входной файл декларации
// и внутри проектов появляется магия, все типы подтянуты вместе с комментариями 
"types": "dist/dts/index.d.ts",

// белый список фалов, которые попадут в публикацию
// никакого мусора в пакете
// README.md, package.json, LICENSE файлы подтянутся в любом случае
"files": [
    "dist/*"
],

// с помощью access решаем либо этот пакет open source, либо private
// с помощью registry решаем куда закинуть пакет
// без registry пакет попадет в npmjs.com
"publishConfig": {
    "access": "public",
    "registry": "ownhosted-registry.com"
} 

// у нас есть возможность добавить свои хуки в процесс публикации
"scripts": {
    "prepublishOnly": "",
    "postpublish": "",
},
```

## Получение приватной зависимости 
Если пакет имеет ограниченный доступ, то без авторизации он не подтянется из реестра.
Самый удобный способ авторизацци можно сделать с помощью файла .npmrc в корне проекта.
```
@urdenko:registry=https://nexus.organization.com/repository/
//nexus.organization.com/repository/:_auth=0LDRgtGL0LTQvtGC0L7RiNC90YvQuTrQvNC+0LvQvtC00LXRhg==
email=admin@organization.com
always-auth=true
```
здесь пример как получить приватный пакет из Nexus реестра:
* указать репозиторий для всех пакетов @urdenko/*
* строка для автризации, после \_auth= идет base64 строки `login:password`
* email пользователя который используется в строке выше
* и так понятно 


