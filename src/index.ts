/* eslint-disable security/detect-object-injection */

// polyfill construct stylesheets
import 'construct-style-sheets-polyfill';

import type { FlcssProperties, StyleSheet, Animation } from './types';

const universalStyleSheet = new CSSStyleSheet();

window.addEventListener('DOMContentLoaded', /* istanbul ignore next */ () =>
{
  document.adoptedStyleSheets = [ universalStyleSheet ];
});

function random() : string
{
  // istanbul ignore if
  if (process.env.NODE_ENV !== 'FLCSS_TEST')
    return Math.random().toString(36).substring(2, 7);
  else
    return 'test';
}

function isValue(obj: unknown)
{
  return (typeof obj === 'string' || typeof obj === 'number');
}

function processProperty(property: string): string
{
  // correct vender prefixes
  if (property.substring(0, 1) === property.substring(0, 1).toUpperCase())
    property = `-${property.substring(0, 1).toLowerCase()}${property.substring(1)}`;

  // transform camelCase to no-caps
  property = property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  
  return property;
}

function parse(selector: string, style: StyleSheet | FlcssProperties)
{
  const obj = { [selector]: style };

  const keys = Object.keys(obj);

  const rules : { selector: string, block: string, declarations: { property: string, value: string }[] }[] = [];

  for (let i = 0; i < keys.length; i++)
  {
    const key = keys[i];

    const rule = obj[key];

    const declarationsList : { property: string, value: string }[] = [];

    for (let property in rule)
    {
      const value = rule[property];

      // rule is probably a nested object
      if (!isValue(value))
      {
        // handle at-rules
        if (property.startsWith('@'))
        {
          // only support at-media
          if (!property.startsWith('@media'))
            continue;
          
          property = key + property;
        }
        else
        {
          // handle appending classnames
          
          const split = key.split('@');

          // appending inside at-rule wrappers
          if (split.length > 1)
            property = split[0] + property + '@' + split[1];
          else
            property = key + property;
        }
  
        obj[property] = value;

        keys.push(property);
      }
      // add the rule
      else
      {
        // corrects vender prefixes and
        // transform camelCase to no-caps
        property = processProperty(property);
  
        declarationsList.push({ property, value });
      }
    }

    // item has no rules
    if (declarationsList.length <= 0)
      continue;

    const block =
      declarationsList
        .map(declaration => `${declaration.property}: ${declaration.value}`)
        .join('; ') + ';';
    
    // handle at-rule wrappers
    if (key.includes('@'))
    {
      const split = key.split('@');

      rules.push({ selector: `@${split[1]}`, block: `${split[0]} { ${block} }`, declarations: declarationsList });
    }
    else
    {
      rules.push({ selector: key, block, declarations: declarationsList });
    }
  }

  return rules;
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
    const declarationsList = [];
    
    const item = animation.keyframes[key];

    for (let property in item)
    {
      const value = item[property];

      // corrects vender prefixes and
      // transform camelCase to no-caps
      property = processProperty(property);

      declarationsList.push(`${property}: ${value}`);
    }

    keyframes.push(`${key} { ${declarationsList.join('; ')}; }`);
  }

  addToStyleSheet(`@keyframes ${animationName}`, keyframes.join(' '));

  if (animation.duration || animation.timingFunction || animation.delay || animation.iterationCount || animation.direction || animation.fillMode)
    return `${animationName} ${duration} ${timingFunction} ${delay} ${iterationCount} ${direction} ${fillMode}`;
  else
    return animationName;
}

export function createStyle<T>(styles: { [key in keyof T]: StyleSheet & FlcssProperties } | StyleSheet) : { [key in keyof T]: string }
{
  const classNames = {};

  const keys = Object.keys(styles);

  for (let i = 0; i < keys.length; i++)
  {
    const key = keys[i];

    let rule = styles[key];
    
    let className = key;

    // key must be a possible classnames
    if (!key.match('^[A-z]'))
      throw new Error(`Error: ${key} is not a valid classname`);

    // create a class name using the original class name as a prefix and a random characters
    // & return generated classnames
    classNames[key] = `flcss-${key}-${random()}`;

    className = `.${classNames[key]}`;

    // handle extending
    if (typeof rule['extend'] === 'string')
    {
      const extendKey = rule['extend'];

      // delete extend property
      delete rule['extend'];

      if (styles[extendKey])
        rule = { ...styles[extendKey], ...rule };
      else
        throw new Error(`Error: can't extend ${key} with ${extendKey} because ${extendKey} does not exists`);
    }

    setStyle(className, rule);
  }

  //@ts-ignore
  return classNames;
}

export function setStyle(selector: string, style: StyleSheet | FlcssProperties) : void
{
  const rules = parse(selector, style);

  rules.forEach(rule => addToStyleSheet(rule.selector, rule.block));
}

export function updateStyle(classname: string, style: StyleSheet | FlcssProperties) : void
{
  const parsedRules = parse(`.${classname}`, style);

  if (parsedRules.length <= 0)
    return;
  
  const existingRules : { [key: string]: { index: number, media?: CSSMediaRule, item: CSSRule } } = {};

  for (let index = 0; index < universalStyleSheet.cssRules.length; index++)
  {
    const item = universalStyleSheet.cssRules[index];

    // handle at-media rules
    if (item instanceof CSSMediaRule)
    {
      //@ts-ignore
      existingRules[`${item.cssRules[0].selectorText}@media ${item.media.mediaText}`] = { index, media: item, item: item.cssRules[0] };
    }
    else
    {
      //@ts-ignore
      existingRules[item.selectorText] = { index, item };
    }
  }
  
  for (const { selector, declarations, block } of parsedRules)
  {
    let key = selector;

    // handle at media
    if (key.startsWith('@media'))
    {
      key = block.substring(0, block.indexOf('{')).trim() + key;
    }
    
    if (!existingRules[key])
    {
      // add it to the stylesheet
      addToStyleSheet(selector, block);
    }
    // but if it exists. update it
    else
    {
      const { item, media, index } = existingRules[key];

      //@ts-ignore
      const styleMap = item.styleMap;

      declarations.forEach((declaration) =>
      {
        // istanbul ignore if
        // if browser support CSS Type OM Level 1
        if (styleMap)
        {
          styleMap.set(declaration.property, declaration.value);
        }
        // browser does not support CSS Type OM Level 1
        else
        {
          //@ts-ignore
          // this should change the value of item.cssText which
          // is used later to replace the rule with the new one
          item.style[declaration.property] = declaration.value;
        }
      });

      // istanbul ignore else
      // if browser does not support CSS Type OM Level 1
      // this is polyfilled by replacing the entire rule
      if (!styleMap)
      {
        removeFromStyleSheet(index);

        let block = item.cssText;

        if (!media)
        {
          block = block.substring(block.indexOf('{') + 1);
          block = block.substring(0, block.lastIndexOf('}')).trim();
        }

        addToStyleSheet(selector, block);
      }
    }
  }
}

function addToStyleSheet(selector: string, style: string)
{
  universalStyleSheet.addRule(selector, style);
}

function removeFromStyleSheet(index: number)
{
  universalStyleSheet.removeRule(index);
}