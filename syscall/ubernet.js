// let rootUrl = 'https://vhihtfwmw3.execute-api.us-west-2.amazonaws.com/prod';
let rootUrl = 'https://ubernet.danopia.net'; // prod
let apiKey = '2ZE8JHg2MS1EyaZthBBZ93XGr8EK3ljt39UTTwm2';

function callEndpoint({endpoint, opts}) {
  return fetch(rootUrl + endpoint, {
    method: 'POST',
    body: JSON.stringify(opts),
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
    },
    mode: 'cors',
    cache: 'no-cache',
  }).then((response) => {
    return response.json();
  }).then(json => {
    if (json.errorMessage) {
      let err = Error(json.errorMessage);
      err.name = json.errorType;
      err.stack = `${json.errorType}: ${json.errorMessage}`;
      if (err.stackTrace) {
        err.satck += '\n' + err.stackTrace.join('\n');
      }
      throw err;
      
    } else {
      return json;
    }
  });
}

REGISTER_SYSCALL('ubernet/register', ({params}) => {
  return callEndpoint({
    endpoint: '/register',
    opts: params,
  });
});

REGISTER_SYSCALL('ubernet/beacon', ({clusterId, params}) => {
  return callEndpoint({
    endpoint: '/clusters/' + MEMBERSHIP.clusterId + '/beacon',
    opts: params,
  });
});
