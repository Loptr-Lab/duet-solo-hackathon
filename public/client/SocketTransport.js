window.DuetSocketTransport = class DuetSocketTransport extends window.DuetITransport {
  constructor(socket) {
    super();
    if (!socket) throw new Error('SocketTransport requires a socket implementation');
    this.socket = socket;
  }
  connect() { if (typeof this.socket.connect === 'function') this.socket.connect(); }
  disconnect() { if (typeof this.socket.disconnect === 'function') this.socket.disconnect(); }
  request(message, payload = {}) {
    return new Promise((resolve) => this.socket.emit(message, payload, resolve));
  }
  on(message, handler) { this.socket.on(message, handler); }
  off(message, handler) { this.socket.off(message, handler); }
  isConnected() { return this.socket.connected === true; }
};
