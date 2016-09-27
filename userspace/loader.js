var moduleCache = {};

function require(path) {
  if (path.constructor === Array) {
    return Promise.all(path.map(require));
  }

  if (path in moduleCache) {
    return moduleCache[path].promise;
  }
  //console.group('Loading', path);

  var module = moduleCache[path] = {
    path: 'userspace/' + path,
    exports: {},
  };

  module.promise = SYSCALL('read-file', {path: 'userspace/' + path})
    .then((source) => {
      module.source = source;
      module.factory = eval([
        '(self, exports, require) => function* (){',
        source, '}//# sourceURL=', module.path
      ].join(''));

      var inflate = module.factory(
        module, module.exports, require);

      return spawnP(inflate);
        /*.then(x => {
          console.groupEnd();
          return x;
        });*/
    }).then(() => module.exports);
  return module.promise;
}

require('main.js');
