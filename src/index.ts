/* eslint-disable security/detect-object-injection */

import { FlcssProperties, StyleSheet, Animation } from './types';

// polyfill construct stylesheets because it's not everywhere
// but flcss will be used everywhere
require('construct-style-sheets-polyfill');

const universalStyleSheet = new CSSStyleSheet();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
document.adoptedStyleSheets = [ ...document.adoptedStyleSheets, universalStyleSheet ];

function isValue(obj: unknown)
{
  return (typeof obj === 'string' || typeof obj === 'number');
}

function random() : string
{
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'test')
    return Math.random().toString(36).substr(2, 7);
  else
    return 'test';
}

function processRule(rule: string): string
{
  // correct vender prefixes
  if (rule.substr(0, 1) === rule.substr(0, 1).toUpperCase())
    rule = `-${rule.substr(0, 1).toLowerCase()}${rule.substr(1)}`;

  // transform camelCase to no-caps
  rule = rule.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  
  return rule;
}

export function createAnimation(animation: Animation) : string
{
  const duration = animation.duration ?? '0s';
  const timingFunction = animation.timingFunction ?? 'ease';
  const delay = animation.delay ?? '0s';
  const iterationCount = animation.iterationCount ?? '1';
  const direction = animation.direction ?? 'normal';
  const fillMode = animation.fillMode ?? 'none';

  // generate a random name for the animation
  const animationName = `flcss-animation-${random()}`;

  const keyframes = [];

  for (const key in animation.keyframes)
  {
    const rulesList = [];
    
    const item = animation.keyframes[key];

    for (let rule in item)
    {
      const value = item[rule];

      // corrects vender prefixes and
      // transform camelCase to no-caps
      rule = processRule(rule);

      rulesList.push(`${rule}: ${value}`);
    }

    keyframes.push(`${key} { ${rulesList.join('; ')}; }`);
  }

  toStyleSheet(`@keyframes ${animationName}`, keyframes.join(' '));

  if (animation.duration || animation.timingFunction || animation.delay || animation.iterationCount || animation.direction || animation.fillMode)
    return `${animationName} ${duration} ${timingFunction} ${delay} ${iterationCount} ${direction} ${fillMode}`;
  else
    return animationName;
}

export function createStyle<T extends StyleSheet>(styles: T | StyleSheet) : T
{
  const classNames = {};

  const keys = Object.keys(styles);

  for (let i = 0; i < keys.length; i++)
  {
    const key = keys[i];

    let item = styles[key];
    
    let className = key;

    // key must be a possible classnames
    if (!key.match('^[A-z]'))
      throw new Error(`Error: ${key} is not a valid classname`);

    // create a class name using the original class name as a prefix and a random characters
    // & return generated classnames
    classNames[key] = className = `flcss-${key}-${random()}`;

    // handle extending
    if (typeof item['extend'] === 'string')
    {
      const extendKey = item['extend'];

      // delete rule
      delete item['extend'];

      if (styles[extendKey])
        item = { ...styles[extendKey], ...item };
      else
        throw new Error(`Error: can't extend ${key} with ${extendKey} because ${extendKey} does not exists`);
    }

    setStyle(className, item);
  }

  return classNames as T;
}

export function setStyle(className: string, style: StyleSheet | FlcssProperties) : void
{
  const selector = `.${className}`;

  const obj = { [selector]: style };

  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++)
  {
    const key = keys[i];

    const item = obj[key];

    const rulesList = [];

    for (let rule in item)
    {
      const value = item[rule];

      // rule is probably a nested object
      if (!isValue(value))
      {
        // handle at-rules
        if (rule.startsWith('@'))
        {
          rule = key + rule;
        }
        else
        {
          // handle appending classnames
          
          const split = key.split('@');

          // appending inside at-rule wrappers
          if (split.length > 1)
            rule = split[0] + rule + '@' + split[1];
          else
            rule = key + rule;
        }
  
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        obj[rule] = value;

        keys.push(rule);
      }
      // add the rule
      else
      {
        // corrects vender prefixes and
        // transform camelCase to no-caps
        rule = processRule(rule);
  
        rulesList.push(`${rule}: ${value}`);
      }
    }

    // item has no rules
    if (rulesList.length <= 0)
      continue;

    // handle at-rule wrappers
    if (key.includes('@'))
    {
      const split = key.split('@');

      toStyleSheet(`@${split[1]}`, `${split[0]} { ${rulesList.join('; ')}; }`);
    }
    else
    {
      toStyleSheet(key, `${rulesList.join('; ')};`);
    }
  }
}

function toStyleSheet(selector: string, style: string)
{
  return universalStyleSheet.addRule(selector, style);
}