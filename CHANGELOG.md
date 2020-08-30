### CHANGES IN v2.0.0
  - much less code means faster performance (probably).
  - slightly better error handling.
  - types are everywhere so writing styles should be much faster in vscode with suggestions and auto-completion.
  - switched to using constructed stylesheets underneath (when it's available).
  - added `setStyle()` to update generated styles or set styles with fixed classnames.

### BREAKING CHANGES IN v2.0.0
 - `createAnimation()` keyframes was changed to use objects like `createStyle()` instead of very long strings (because it's CSS-in-JS not Strings-in-JS).
 
 - support for replacing `'%this'` with generated classnames was removed.