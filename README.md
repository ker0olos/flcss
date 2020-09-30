[![npm (tag)](https://img.shields.io/npm/v/flcss/latest)](http://npmjs.com/package/flcss)
![Test](https://github.com/ker0olos/flcss/workflows/Test/badge.svg?branch=master) 
![CodeQL](https://github.com/ker0olos/flcss/workflows/CodeQL/badge.svg)
[![codecov](https://codecov.io/gh/ker0olos/flcss/branch/master/graph/badge.svg)](https://codecov.io/gh/ker0olos/flcss)

### CHANGES IN v2.0.0
  - this is a full re-write of FLCSS.
  - less code means faster performance (probably).
  - slightly better error handling.
  - types are everywhere so writing styles should be much faster in vscode with suggestions and auto-completion.
  - switched to using constructed stylesheets underneath (when it's available).
  - added `setStyle()` to set styles for any selector.
  - added `updateStyle()` to update styles after they were created.

### BREAKING CHANGES IN v2.0.0
 - `createAnimation()` keyframes was changed to use objects like `createStyle()` instead of very long strings (because it's CSS-in-JS not Strings-in-JS).
 
 - support for replacing `'%this'` with generated classnames was removed.

<br>

A bad attempt of CSS-in-JS.

It supports all of the things: selectors, pseudo-classes, pseudo-elements, attributes, vendor prefixes, media queries and animations.

It also comes with custom features like extending.

## Installation

`npm install flcss`

## Usage

flcss will work with any framework that allows you to set class names.

```jsx
import React from 'react';
import { createStyle } from 'flcss';

const Box = () => {
  return <div className={ styles.red }/>;
};

const styles = createStyle({
  red: {
    padding: '15px',
    backgroundColor: 'red'
  }
});

export default Box;
```

### Extending

```js
const styles = createStyle({
  red: {
    padding: '15px',
    backgroundColor: 'red'
  },
  blue: {
    extend: 'red',
    backgroundColor: 'blue'
  }
});
```

### Pseudo-classes and Pseudo-elements

```js
const styles = createStyle({
  red: {
    padding: '15px',
    backgroundColor: 'red',

    ':hover': {
      backgroundColor: 'black',
    }
  }
});
```

```js
const styles = createStyle({
  input: {
    fontSize: '12px',
    color: 'black',

    '::placeholder': {
      color: 'grey'
    }
  }
});
```

### Media Queries

```js
const styles = createStyle({
  red: {
    padding: '15px',
    backgroundColor: 'red',

    '@media screen and (max-width: 1080px)': {
      padding: '8px'
    }
  }
});
```

### Attributes

```js
const styles = createStyle({
  button: {
    padding: '15px',
    cursor: 'pointer',
    backgroundColor: 'black',

    '[enabled="false"]': {
      cursor: 'default',
      pointerEvents: 'none',
      backgroundColor: 'grey'
    }
  }
});
```

### Child Selectors

```js
const styles = createStyle({
  red: {
    padding: '15px',
    backgroundColor: 'red',

    '> div': {
      padding: '25px',
      backgroundColor: 'green',
    }
  }
});
```


### Animations

```js
const boxAnimation = createAnimation({
  keyframes: {
    from: {
      margin: '5px'
    },
    to: {
      margin: '10px'
    }
  },
  duration: '0.5s',
  timingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  fillMode: 'forwards',
  iterationCount: '1'
});

const styles = createStyle({
  box: {
    animation: boxAnimation
  }
})
```

```js
const hoverAnimation = createAnimation({
  keyframes: {
    '0%': {
      transform: 'translateY(-10px)';
    },
    '50%': {
      transform: 'translateY(-5px)';
    },
    '100%': {
      transform: 'translateY(-10px)';
    }
  }
});

const floatAnimation = createAnimation({
  keyframes: {
    '100%': {
      transform: 'translateY(-10px)';
    }
  }
});

const styles = createStyle({
  box: {
      animationName: `${floatAnimation}, ${hoverAnimation}`,
      animationDuration: '.3s, 1.5s',
      animationDelay: '0s, .3s',
      animationTimingFunction: 'ease-out, ease-in-out',
      animationIterationCount: '1, infinite',
      animationFillMode: 'forwards',
      animationDirection: 'normal, alternate'
    }
  }
})
```

Basically, do anything you want, it will probably work, and if it didn't then open an issue and request it, and we'll add it.