/* eslint-disable security/detect-object-injection */

jest.mock('construct-style-sheets-polyfill', () => undefined);

class CSSRule
{
  constructor(selector: string, style: string)
  {
    this.selectorText = selector;

    // this code is unsafe
    // but since this is a predictable test environment
    // it's fine

    const declarations = style.split(';');

    declarations.forEach(declaration =>
    {
      if (declaration.trim().length <= 0)
        return;
        
      const split = declaration.split(':');

      if (split.length === 2)
        this.style[split[0].trim()] = split[1].trim();
    });
  }

  style = [];
  
  selectorText = undefined;
  
  get cssText()
  {
    const declarationsList =
      Object.keys(this.style)
        .map(key => `${key}: ${this.style[key]}`);

    return `${this.selectorText} { ${declarationsList.join('; ')}; }`;
  }
}

class CSSMediaRule
{
  constructor(selector: string, style: string)
  {
    this.media = {
      mediaText: selector.replace('@media', '').trim()
    };

    const childSelector = style.substr(0, style.indexOf('{')).trim();

    style = style.substr(style.indexOf('{') + 1);

    style = style.substr(0, style.lastIndexOf('}')).trim();

    this.cssRules = [ new CSSRule(childSelector, style) ];
  }

  cssRules = []

  media = {}
}

class CSSStyleSheet
{
  cssRules = []

  addRule = jest.fn().mockImplementation((selector: string, style: string) =>
  {
    if (selector.startsWith('@media'))
      this.cssRules.push(new CSSMediaRule(selector, style));
    else
      this.cssRules.push(new CSSRule(selector, style));
  })

  removeRule = jest.fn((index: number) =>
  {
    this.cssRules.splice(index, 1);
  })
}

const stylesheet = new CSSStyleSheet();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.CSSStyleSheet = () => stylesheet;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.CSSRule = CSSRule, global.CSSMediaRule = CSSMediaRule;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
global.window = {
  addEventListener: () => undefined
};

process.env.NODE_ENV = 'FLCSS_TEST';

import { setStyle, createStyle, updateStyle, createAnimation } from '../src/index';

beforeEach(() =>
{
  // clear any stored calls of addRule and removeRule

  stylesheet.addRule.mockClear();
  stylesheet.removeRule.mockClear();

  // clear all created rules
  stylesheet.cssRules = [];
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

  expect(Object.keys(styles)).toHaveLength(2);
  
  expect(styles.wrapper).toEqual('flcss-wrapper-test');
  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(2);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-wrapper-test', 'width: 100%; height: 100%;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test', 'width: 100px; height: 100px; background-color: red;');
});

test('Creating Styles For Fixed Selectors', () =>
{
  setStyle('body', {
    width: '100%',
    height: '100%'
  });

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, 'body', 'width: 100%; height: 100%;');
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

  expect(Object.keys(styles)).toHaveLength(1);
  
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

  expect(Object.keys(styles)).toHaveLength(1);

  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(3);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; height: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test:hover', 'background-color: blue;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '.flcss-container-test[visible="false"]', 'display: none;');
});

test('Creating At Media Styles', () =>
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

  expect(Object.keys(styles)).toHaveLength(1);

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

  expect(Object.keys(styles)).toHaveLength(2);

  expect(styles.red).toEqual('flcss-red-test');
  expect(styles.blue).toEqual('flcss-blue-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(4);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-red-test', 'width: 100px; height: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-red-test:hover', 'background-color: black;');
  
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '.flcss-blue-test', 'width: 100px; height: 100px; background-color: blue;');
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

test('Updating Common Styles', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      height: '100px',
      backgroundColor: 'red'
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);

  expect(styles.container).toEqual('flcss-container-test');

  // update style

  updateStyle(styles.container, {
    height: '50px',
    backgroundColor: 'yellow'
  });

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(2);
  expect(stylesheet.removeRule).toHaveBeenCalledTimes(1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; height: 100px; background-color: red;');

  // updated styles

  expect(stylesheet.removeRule).toHaveBeenNthCalledWith(1, 0);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test', 'width: 100px; height: 50px; background-color: yellow;');
});

test('Updating Styles to Add Pseudos', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      backgroundColor: 'red'
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);

  expect(styles.container).toEqual('flcss-container-test');

  // update style

  updateStyle(styles.container, {
    ':hover': {
      backgroundColor: 'yellow'
    }
  });

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(2);
  expect(stylesheet.removeRule).toHaveBeenCalledTimes(0);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test:hover', 'background-color: yellow;');
});

test('Updating Styles to Add At Media', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      backgroundColor: 'red'
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);

  expect(styles.container).toEqual('flcss-container-test');

  // update style

  updateStyle(styles.container, {
    '@media screen and (max-width: 600px)': {
      backgroundColor: 'yellow',
      ':hover': {
        backgroundColor: 'black'
      }
    }
  });

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(3);
  expect(stylesheet.removeRule).toHaveBeenCalledTimes(0);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '@media screen and (max-width: 600px)', '.flcss-container-test { background-color: yellow; }');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '@media screen and (max-width: 600px)', '.flcss-container-test:hover { background-color: black; }');
});

test('Updating Styles With Pseudos', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      backgroundColor: 'red',
      
      ':hover': {
        width: '50px',
        backgroundColor: 'yellow'
      }
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);

  expect(styles.container).toEqual('flcss-container-test');

  // update style

  updateStyle(styles.container, {
    ':hover': {
      backgroundColor: 'black'
    }
  });

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(3);
  expect(stylesheet.removeRule).toHaveBeenCalledTimes(1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '.flcss-container-test:hover', 'width: 50px; background-color: yellow;');

  // updated styles

  expect(stylesheet.removeRule).toHaveBeenNthCalledWith(1, 1);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '.flcss-container-test:hover', 'width: 50px; background-color: black;');
});

test('Updating Styles With At Media', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      backgroundColor: 'red',
      '@media screen and (max-width: 600px)': {
        backgroundColor: 'yellow',

        ':hover': {
          backgroundColor: 'black'
        }
      }
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);

  expect(styles.container).toEqual('flcss-container-test');

  // update style

  updateStyle(styles.container, {
    '@media screen and (max-width: 600px)': {
      backgroundColor: 'blue',
      ':hover': {
        backgroundColor: 'white'
      }
    }
  });

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(5);
  expect(stylesheet.removeRule).toHaveBeenCalledTimes(2);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(1, '.flcss-container-test', 'width: 100px; background-color: red;');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(2, '@media screen and (max-width: 600px)', '.flcss-container-test { background-color: yellow; }');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(3, '@media screen and (max-width: 600px)', '.flcss-container-test:hover { background-color: black; }');
  
  // updated styles

  expect(stylesheet.removeRule).toHaveBeenNthCalledWith(1, 1);
  expect(stylesheet.removeRule).toHaveBeenNthCalledWith(2, 2);

  expect(stylesheet.addRule).toHaveBeenNthCalledWith(4, '@media screen and (max-width: 600px)', '.flcss-container-test { background-color: blue; }');
  expect(stylesheet.addRule).toHaveBeenNthCalledWith(5, '@media screen and (max-width: 600px)', '.flcss-container-test:hover { background-color: white; }');
});

test('Invalid Classnames', () =>
{
  expect(() => createStyle({
    '#': {
      width: '100%',
      height: '100%'
    }
  })).toThrow('Error: # is not a valid classname');
});

test('Invalid Extend', () =>
{
  expect(() => createStyle({
    red: {
      backgroundColor: 'red'
    },
    blue: {
      extend: 'yellow',
      backgroundColor: 'blue'
    }
  })).toThrow('Error: can\'t extend blue with yellow because yellow does not exists');
});

test('Skipping Different (At)Rules', () =>
{
  const styles = createStyle({
    container: {
      '@font-face': {
        fontFamily: '1'
      }
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);
  
  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(0);
});

test('Skip Creating Empty Styles', () =>
{
  const styles = createStyle({
    container: {}
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);
  
  expect(styles.container).toEqual('flcss-container-test');

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(0);
});

test('Skip Updating Empty Styles', () =>
{
  const styles = createStyle({
    container: {
      width: '100px',
      backgroundColor: 'red'
    }
  });

  // return values

  expect(Object.keys(styles)).toHaveLength(1);
  
  expect(styles.container).toEqual('flcss-container-test');

  updateStyle(styles.container, {});

  // generated styles

  expect(stylesheet.addRule).toHaveBeenCalledTimes(1);
  expect(stylesheet.removeRule).toHaveBeenCalledTimes(0);
});