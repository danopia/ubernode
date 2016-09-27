let contexts = new Map();

function randomId() {
  // TODO: not secure at all
  return Math.random().toString(16).slice(2);
}

window.addEventListener('message', (event) => {
  let {type, error, value, contextId} = event.data;
  
  let context = contexts.get(contextId);
  if (contexts.delete(contextId)) {
    if (error) {
      console.log(`System ${type} ${contextId} ERR:`, error);
      context.reject(error);
    } else {
      // console.info(`System ${type} to ${contextId}`);
      context.resolve(value);
    }
    
  } else {
    console.log(`Got ${type} from system, but on unknown context ${contextId}`);
  }
});

window.SYSCALL = (name, params) => {
  let contextId = randomId();
  // todo: check unused
  
  // register context
  let promise = new Promise((resolve, reject) => {
    contexts.set(contextId, {
      resolve: resolve,
      reject: reject,
      
      command: name,
      dateSent: new Date(),
    });
  });
  
  window.parent.postMessage({
    type: 'syscall',
    command: name,
    params: params,
    contextId: contextId,
  }, '*');
  
  return promise;
};