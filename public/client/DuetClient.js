window.DuetClient = class DuetClient {
  constructor({ transport, identity = null } = {}) {
    if (!transport) throw new Error('DuetClient requires a transport');
    this.transport = transport;
    this.identity = identity;
    this.snapshot = null;
    this.roomCode = null;
    this.color = null;
    this.reconnectToken = null;
    this.listeners = { state_update: new Set(), opponent_joined: new Set(), error: new Set() };
    this.transport.on('state_update', ({ state }) => this._state(state));
    this.transport.on('opponent_joined', ({ state }) => {
      this._state(state);
      this._emit('opponent_joined', state);
    });
  }
  connect() { return this.transport.connect(); }
  async createRoom() { return this._handleRoomResult(await this.transport.request('create_room', {})); }
  async joinRoom(roomCode) { return this._handleRoomResult(await this.transport.request('join_room', { roomId: roomCode })); }
  async rejoinRoom(roomCode, color, reconnectToken) {
    return this._handleRoomResult(await this.transport.request('rejoin_room', { roomId: roomCode, color, reconnectToken }));
  }
  async sendMove(intent) {
    const result = await this.transport.request('make_move', intent);
    if (!result || result.ok !== true) this._emit('error', result || { ok: false, reason: 'Move rejected.' });
    if (result?.state) this._state(result.state);
    return result;
  }
  onStateUpdate(handler) { return this.on('state_update', handler); }
  onError(handler) { return this.on('error', handler); }
  on(event, handler) {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event].add(handler);
    return () => this.listeners[event].delete(handler);
  }
  disconnect() { return this.transport.disconnect(); }
  _handleRoomResult(result) {
    if (!result || result.ok !== true) {
      this._emit('error', result || { ok: false, reason: 'Room request failed.' });
      return result;
    }
    this.roomCode = result.roomId;
    this.color = result.color;
    this.reconnectToken = result.reconnectToken || this.reconnectToken;
    if (result.state) this._state(result.state);
    return result;
  }
  _state(snapshot) { this.snapshot = snapshot; this._emit('state_update', snapshot); }
  _emit(event, value) { for (const handler of this.listeners[event] || []) handler(value); }
};
