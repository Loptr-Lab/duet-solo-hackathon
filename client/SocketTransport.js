const { ITransport } = require('./ITransport.js');

/** Socket.IO adapter. DUET client code should depend on ITransport instead. */
class SocketTransport extends ITransport {
  constructor(socket) {
    super();
    if (!socket) throw new Error('SocketTransport requires a socket implementation');
    this.socket = socket;
  }

  connect() {
    if (typeof this.socket.connect === 'function') this.socket.connect();
  }

  disconnect() {
    if (typeof this.socket.disconnect === 'function') this.socket.disconnect();
  }

  request(message, payload = {}) {
    return new Promise((resolve) => {
      this.socket.emit(message, payload, resolve);
    });
  }

  on(message, handler) { this.socket.on(message, handler); }
  off(message, handler) { this.socket.off(message, handler); }
  isConnected() { return this.socket.connected === true; }
}

module.exports = { SocketTransport };
