jest.mock('construct-style-sheets-polyfill', () => undefined);

const stylesheet = {
  addRule: jest.fn()
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.CSSStyleSheet = () => stylesheet;

global.document = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  adoptedStyleSheets: []
};

import { createStyle, createAnimation } from '../src/index';

beforeEach(() =>
{
  // clear any stored calls of addRule
  stylesheet.addRule.mockReset();
});

test('Creating Common Styles', () =>
{
  const styles = createStyle({
    wrapper: {
      width: '100%',
      height: '100%'
    },
    container: {
      width: '100px',
      height: '100px',
      backgroundColor: 'red'
    }
  });

  // return values

  expect(Object.keys(styles).length).toBe(2);
  
  expect(styles.wrapper).toEqual('flcss-wrapper-test');
  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(2);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-wrapper-test', 'width: 100%; height: 100%;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test', 'width: 100px; height: 100px; background-color: red;');
});

test('Creating Styles With Vendor Prefixes', () =>
{
  const styles = createStyle({
    container: {
      backgroundColor: 'red',
      WebkitBackdropFilter: 'blur(2px)'
    }
  });

  // return values

  expect(Object.keys(styles).length).toBe(1);
  
  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'background-color: red; -webkit-backdrop-filter: blur(2px);');
});

test('Creating Pseudos & Attributes Styles', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      height: '100px',
      backgroundColor: 'red',
      ':hover': {
        backgroundColor: 'blue'
      },
      '[visible="false"]': {
        display: 'none'
      }
    }
  });

  // return values

  expect(Object.keys(styles).length).toBe(1);

  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(3);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; height: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test:hover', 'background-color: blue;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '.flcss-container-test[visible="false"]', 'display: none;');
});

test('Creating At Rules Styles', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      height: '100px',
      backgroundColor: 'red',
      '@media screen and (max-width: 600px)': {
        backgroundColor: 'blue',
        ':hover': {
          backgroundColor: 'yellow'
        }
      }
    }
  });

  // return values

  expect(Object.keys(styles).length).toBe(1);

  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(3);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; height: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '@media screen and (max-width: 600px)', '.flcss-container-test { background-color: blue; }');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '@media screen and (max-width: 600px)', '.flcss-container-test:hover { background-color: yellow; }');
});

test('Creating Extended Styles', () =>
{
  const styles = createStyle({
    red: {
      width: '100px',
      height: '100px',
      backgroundColor: 'red',
      ':hover': {
        backgroundColor: 'black'
      }
    },
    blue: {
      extend: 'red',
      backgroundColor: 'blue'
    }
  });

  // return values

  expect(Object.keys(styles).length).toBe(2);

  expect(styles.red).toEqual('flcss-red-test');
  expect(styles.blue).toEqual('flcss-blue-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(4);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-red-test', 'width: 100px; height: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-blue-test', 'width: 100px; height: 100px; background-color: blue;');

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '.flcss-red-test:hover', 'background-color: black;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(4, '.flcss-blue-test:hover', 'background-color: black;');
});

test('Creating Animations', () =>
{
  const animation = createAnimation({
    keyframes: {
      from: {
        top: '0px'
      },
      '50%': {
        top: '50px'
      },
      to: {
        top: '200px'
      }
    }
  });

  // return values

  expect(animation).toEqual('flcss-animation-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '@keyframes flcss-animation-test', 'from { top: 0px; } 50% { top: 50px; } to { top: 200px; }');
});

test('Creating Animations With Properties', () =>
{
  const animation = createAnimation({
    keyframes: {
      from: {
        top: '0px'
      },
      '50%': {
        top: '50px'
      },
      to: {
        top: '200px'
      }
    },
    duration: '1s',
    timingFunction: 'ease-in-out',
    delay: '5s',
    iterationCount: 1,
    direction: 'normal',
    fillMode: 'forwards'
  });

  // return values

  expect(animation).toEqual('flcss-animation-test 1s ease-in-out 5s 1 normal forwards');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '@keyframes flcss-animation-test', 'from { top: 0px; } 50% { top: 50px; } to { top: 200px; }');
});