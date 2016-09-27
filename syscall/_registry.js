window.SYSCALLS = new Map();

window.addEventListener('message', (event) => {
  let {type, command, params, contextId} = event.data;
  console.info('Syscall', command, 'invoked with', params);
  
  function respond(err, value) {
    event.source.postMessage({
      type: 'response',
      contextId: contextId,
      error: err,
      value: value,
    }, '*');
  }
  
  switch (type) {
    case 'syscall':
      let handler = SYSCALLS.get(command);
      if (!handler) {
        respond(new Error(`Syscall '${command}' is not present`));
        break;
      }
      
      // TODO: security
      
      handler.invoke(params)
        .then(value => respond(null, value))
        .catch(err => respond({
          name: err.name,
          message: err.message,
        }, null));
      break;
      
    default:
      respond(new Error(`Only the 'syscall' message is implemented`));
  }
});

window.REGISTER_SYSCALL = (name, handler) => {
  if (SYSCALLS.has(name)) {
    throw new Error(`Can't register syscall ${name} - already registered`);
  }
  
  SYSCALLS.set(name, {
    name: name,
    invoke: handler,
  });
};