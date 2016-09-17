var moduleCache = {};

function require(path) {
  if (path.constructor === Array) {
    return Promise.all(path.map(require));
  }

  if (path in moduleCache) {
    return moduleCache[path].promise;
  }

  var module = moduleCache[path] = {
    path: 'js/' + path,
    exports: {},
  };

  return module.promise = fetch('js/' + path)
    .then((response) => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('HTTP error loading js/' + path);
      }
    })
    .then((source) => {
      module.source = source;
      module.factory = eval([
        '(self, exports, require) => function* (){',
        source, '}//# sourceURL=', module.path
      ].join(''));

      var inflate = module.factory(
        module, module.exports, require);

      return spawnP(inflate);
    }).then(() => module.exports);
}
require('main.js');
