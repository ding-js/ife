const fs = require('fs');

const path = 'src/router/index.ts';

let router = fs.readFileSync(path, {
  encoding: 'utf8'
});

router = 'declare const __webpack_public_path__: string;\n' + router;

router = router.replace(
  /mode:\s?\'.+\',/,
  "mode: 'history',\n  base: __webpack_public_path__,"
);

fs.writeFileSync(path, router, {
  encoding: 'utf8'
});
