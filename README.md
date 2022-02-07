[![npm (tag)](https://img.shields.io/npm/v/flcss/latest)](http://npmjs.com/package/flcss)
![unit-tests](https://github.com/ker0olos/flcss/workflows/unit-tests/badge.svg?branch=master) 
![chrome](https://github.com/ker0olos/flcss/workflows/chromium/badge.svg?branch=master) 
![firefox](https://github.com/ker0olos/flcss/workflows/firefox/badge.svg?branch=master) 
![safari](https://github.com/ker0olos/flcss/workflows/webkit/badge.svg?branch=master) 
[![codecov](https://codecov.io/gh/ker0olos/flcss/branch/master/graph/badge.svg)](https://codecov.io/gh/ker0olos/flcss)

A bleeding-edge CSS-in-JS library.

It supports all of the things: selectors, pseudo-classes, pseudo-elements, attributes, vendor prefixes, media queries and animations.

It also comes with custom features like extending and react hooks support.

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

### But also there's support to React hooks

```jsx
import React, { useState } from 'react';

import { useStyles } from 'flcss/react';

const App = () => {
  const [ color, setColor ] = useState('red');

  const styles = useStyles({
    box: {
      padding: '15px',
      backgroundColor: color
    }
  });

  return <div className={ styles.box }/>;
}
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
