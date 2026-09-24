/** Platform-neutral transport boundary for DUET clients. */
class ITransport {
  async connect() { throw new Error('ITransport.connect() must be implemented'); }
  disconnect() { throw new Error('ITransport.disconnect() must be implemented'); }
  request(_message, _payload) { throw new Error('ITransport.request() must be implemented'); }
  on(_message, _handler) { throw new Error('ITransport.on() must be implemented'); }
  off(_message, _handler) { throw new Error('ITransport.off() must be implemented'); }
  isConnected() { throw new Error('ITransport.isConnected() must be implemented'); }
}

module.exports = { ITransport };
