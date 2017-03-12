const timers = require('timers');
const EventEmitter = require('events');
const Ping = require('ping-lite');
const dns = require('dns-socket');
const resolv = require('resolv');

const dnsLatency = (hostname, timeout) =>
  new Promise((resolve, reject) => {
    var socket = dns({ timeout });
    const nameserver = resolv().nameserver[0];
    const query = { questions: [{ type: 'A', name: hostname }] };
    const dnsStartMs = +(new Date());
    socket.query(query, 53, nameserver, error =>
      error ? reject(error) : resolve(+(new Date()) - dnsStartMs));
  }
);

const pingLatency = (address) =>
  new Promise((resolve, reject) =>
    new Ping(address).send((error, latencyMs) =>
      error ? reject(error) : resolve(Math.round(latencyMs))
    )
);

const timeout = (promise, timeoutMs) => {
  let timer = null;
  const clearTimeout = () => timers.clearTimeout(timer);
  return Promise.race([
    promise,
    new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('timed out')), timeoutMs);
    })
  ])
  .then(value => { clearTimeout(); return value; })
  .catch(error => { clearTimeout(); throw error; });
};

const allIgnoreErrors = (promises) => Promise.all(
  promises.map(promise => promise.catch(() => null))
);

const checkLatencies = ({ hostname, address, timeoutMs }) =>
  allIgnoreErrors([
    dnsLatency(hostname, timeoutMs).catch(() => null),
    timeout(pingLatency(address), timeoutMs).catch(() => null)
  ]);

const networkStatus = (options) => {
  const latencies = new EventEmitter();
  const emitLatencies = () => checkLatencies(options)
    .then(([dns, ping]) =>
      latencies.emit('latencies', { dns, ping })
    );
  emitLatencies();
  setInterval(emitLatencies, options.intervalMs);
  return latencies;
};

if (require.main === module) {
  networkStatus({
    timeoutMs: 2000,
    intervalMs: 2000,
    hostname: 'google.com',
    address: '8.8.8.8'
  }).on('latencies', console.log);
}

module.exports = networkStatus;
