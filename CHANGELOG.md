### CHANGES IN v2.0.0
  - much less code means faster performance (probably).
  - types are everywhere so writing styles should be much faster in vscode with suggestions and auto-completion.
  - switched to using constructed stylesheets underneath (when it's available).

### BREAKING CHANGES IN v2.0.0
 - createAnimation()'s keyframes was changed to use objects like createStyles() instead of very long strings (because it's CSS-in-JS not Strings-in-JS).
 
 - support for replacing '%this' with generated classname was removed to keep things simple.