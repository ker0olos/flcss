/* eslint-disable security/detect-object-injection */

import { StyleSheet, Animation } from './types';

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

function processRule(rule: string): string
{
  // correct vender prefixes
  if (rule.substr(0, 1) === rule.substr(0, 1).toUpperCase())
    rule = `-${rule.substr(0, 1).toLowerCase()}${rule.substr(1)}`;

  // transform camelCase to no-caps
  rule = rule.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  
  return rule;
}

function random() : string
{
  if (process.env.NODE_ENV !== 'test')
    return Math.random().toString(36).substr(2, 7);
  else
    return 'test';
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

  const orgLength = keys.length;
  
  for (let i = 0; i < keys.length; i++)
  {
    const rulesList = [];
    
    const key = keys[i];

    let item = styles[key];
    
    let selector = key;

    // if an original item
    // not a nested item
    if (i < orgLength)
    {
      // original items must be possible classnames
      if (!key.match('^[A-z]'))
        return;

      // create a class name using the original class name as a prefix and a random characters
      selector = `.flcss-${key}-${random()}`;

      // return generated classnames
      classNames[key] = selector.substr(1);

      // handle extending
      if (typeof item['extend'] === 'string')
      {
        const key = item['extend'];

        // delete rule
        delete item['extend'];

        if (styles[key])
          item = { ...styles[key], ...item };
      }
    }

    for (let rule in item)
    {
      const value = item[rule];

      // rule is probably a nested object
      if (!isValue(value))
      {
        // value in undefined
        if (!value)
          continue;
        
        // handle at-rules
        if (rule.startsWith('@'))
        {
          rule = selector + rule;
        }
        else
        {
          // handle appending classnames
          
          const split = selector.split('@');

          // appending inside at-rule wrappers
          if (split.length > 1)
            rule = split[0] + rule + '@' + split[1];
          else
            rule = selector + rule;
        }
  
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        styles[rule] = value;

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
    if (selector.includes('@'))
    {
      const split = selector.split('@');

      toStyleSheet(`@${split[1]}`, `${split[0]} { ${rulesList.join('; ')}; }`);
    }
    else
    {
      toStyleSheet(selector, `${rulesList.join('; ')};`);
    }
  }

  return classNames as T;
}

function toStyleSheet(selector: string, style: string)
{
  return universalStyleSheet.addRule(selector, style);
}