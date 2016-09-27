var UberNet = exports;

UberNet.register = (opts) => {
  return SYSCALL('ubernet/register', {
    params: opts,
  });
};

UberNet.beacon = (opts) => {
  return SYSCALL('ubernet/beacon', {
    clusterId: MEMBERSHIP.clusterId,
    params: opts,
  });
};
