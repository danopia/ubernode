REGISTER_SYSCALL('read-file', (params) => {
  let {path} = params;
  
  return fetch(path, {cache: 'no-store'})
  .then((response) => {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error(`HTTP error loading ${path}`);
    }
  });
});