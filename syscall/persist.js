REGISTER_SYSCALL('persist/read', (params) => {
  return new Promise((resolve) => {
    let {key} = params;
    let realKey = 'persist_' + key;
    
    chrome.storage.local.get(realKey, (values) => {
      if (realKey in values) {
        resolve(JSON.parse(values[realKey]));
      } else {
        resolve(null);
      }
    });
  });
});

REGISTER_SYSCALL('persist/write', (params) => {
  let {key, value} = params;
  let realKey = 'persist_' + key;
  
  let obj = {};
  obj[realKey] = JSON.stringify(value);
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(obj, () => {
      if (!chrome.runtime.lastError) {
        resolve(null);
        
      } else {
        reject(chrome.runtime.lastError);
      }
    });
  });
});
