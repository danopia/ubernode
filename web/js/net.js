var UberNet = exports;
// UberNet.rootUrl = 'https://vhihtfwmw3.execute-api.us-west-2.amazonaws.com/prod';
UberNet.rootUrl = 'https://ubernet.danopia.net'; // prod
UberNet.apiKey = '2ZE8JHg2MS1EyaZthBBZ93XGr8EK3ljt39UTTwm2';

UberNet.register = (opts) => {
  return fetch(UberNet.rootUrl + '/register', {
    method: 'POST',
    body: JSON.stringify(opts),
    headers: {
      'content-type': 'application/json',
      'x-api-key': UberNet.apiKey,
    },
    mode: 'cors',
    cache: 'no-cache',
  }).then((response) => {
    return response.json();
  });
};

UberNet.beacon = (opts) => {
  return fetch(UberNet.rootUrl + '/clusters/' + localStorage.clusterId + '/beacon', {
    method: 'POST',
    body: JSON.stringify(opts),
    headers: {
      'content-type': 'application/json',
      'x-api-key': UberNet.apiKey,
    },
    mode: 'cors',
    cache: 'no-cache',
  }).then((response) => {
    return response.json();
  });
};
