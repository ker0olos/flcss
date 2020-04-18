![npm (tag)](https://img.shields.io/npm/v/flcss/latest)
![npm](https://img.shields.io/npm/dm/flcss)

# FLCSS

A very bad implementation of CSS-in-JS.

But it supports all of the things like selectors, pseudo-classes, pseudo-elements, attributes, vendor prefixes.

It also has some custom features like extending but properly is one of the slowest implementations of CSS-in-JS.

but yeah, because of all that it's not the fastest CSS-in-JS library out there.

## Installation

`npm install --save-dev flcss`

## Usage

flcss will work with any web framework that allows you to set class names.

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
  duration: '0.5s',
  timingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
  fillMode: 'forwards',
  iterationCount: '1',
  keyframes: `100% {
    margin: 5px
  }
  100% {
    margin: 10px
  }`
});

const styles = createStyle({
  box: {
    animation: boxAnimation
  }
})
```

```js
const hoverAnimation = createAnimation({
  options: {
    returnNameOnly: true
  },
  keyframes: `0% {
    transform: translateY(-10px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(-10px);
  }`
});

const floatAnimation = createAnimation({
  options: {
    returnNameOnly: true
  },
  keyframes: `100% {
    transform: translateY(-10px);
  }`
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

###  Other Examples

```js
const styles = createStyle({
  red: {
    padding: '15px',
    backgroundColor: 'red',

    '> :hover': {
      padding: '15px',
      backgroundColor: 'yellow',
    }
  }
});
```

```js
const styles = createStyle({
  container: {
    width: '100%',

    ' .red-box': {
      padding: '15px',
      backgroundColor: 'red'
    }
  }
});
```

Basically, do anything you want, it will probably work, and if it didn't then open an issue and request it, and we'll add it.