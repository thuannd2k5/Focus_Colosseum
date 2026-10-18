// Polyfill WebSocket for Jest environment
if (typeof global.WebSocket === 'undefined') {
  try {
    global.WebSocket = require('ws');
  } catch {
    // fallback empty mock if ws is missing
    global.WebSocket = class MockWebSocket {
      addEventListener() {}
      removeEventListener() {}
      send() {}
      close() {}
    } as any;
  }
}
