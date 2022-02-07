/* eslint-disable security/detect-object-injection */

import { useState } from 'react';

import { createStyle, updateStyle } from './index';

import type { FlcssProperties, StyleSheet } from './types';

export function useStyles<T>(styles: { [key in keyof T]: StyleSheet & FlcssProperties } | StyleSheet) : { [key in keyof T]: string }
{
  const [ old, setOld ] = useState(null);
  const [ output, setOutput ] = useState(null);

  if (output === null)
  {
    const classNames = createStyle(styles);

    setOld(styles);
    setOutput(classNames);

    return classNames;
  }
  else if (JSON.stringify(old) !== JSON.stringify(styles))
  {
    setOld(styles);
  }

  Object.keys(output).forEach(key =>
  {
    const className = output[key];
      
    if (JSON.stringify(styles[key]) !== JSON.stringify(old[key]))
      updateStyle(className, styles[key]);
  });

  return output;
}