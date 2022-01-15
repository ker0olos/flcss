### CHANGES IN v2.4.0

- A React hook to allow you to easily update styles

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

### CHANGES IN v2.0.0
  - less code means faster performance (probably).
  - slightly better error handling.
  - types are everywhere so writing styles should be much faster in vscode with suggestions and auto-completion.
  - switched to using constructed stylesheets underneath (when it's available).
  - added `setStyle()` to set styles for any selector.
  - added `updateStyle()` to update styles after they were created.

### BREAKING CHANGES IN v2.0.0
 - `createAnimation()` keyframes was changed to use objects like `createStyle()` instead of very long strings (because it's CSS-in-JS not Strings-in-JS).
 
 - support for replacing `'%this'` with generated classnames was removed.