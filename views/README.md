# handlebars rule
Your file/folder structure MUST be set up this way for Handlebars.js to work correctly. 
You will always have a main layout located at (and named) views/layouts/main.handlebars. 
All other template files will go directly in the views folder (views/welcome.handlebars).

Notice that there's a special placeholder in the <main> element: {{{ body }}}. This is Handlebars.js syntax for data that will be plugged in later.