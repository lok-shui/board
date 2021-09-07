/**
 * http://ait-qr-problem-service.ait.dev.dm-ai.cn/doc/swagger
 *
 */

module.exports = {
    '/socket.io': {
        target: 'https://socket-io-server-ait.dev.dm-ai.cn',
        changeOrigin: true,
        ws: true
    },
    '/api/v1': {
        target: 'https://mashup-server-ait.dev.dm-ai.cn',
        // target: 'http://192.168.4.54:3001',
        ws: true,
        changeOrigin: true,
        clientLogLevel: 'debug'
    },
    '/api/v2': {
        target: 'https://mashup-server-ait.dev.dm-ai.cn',
        // target: 'http://192.168.4.54:3001',
        ws: true,
        changeOrigin: true,
        clientLogLevel: 'debug'
    },
    '/files': {
        // target: 'http://ait-file-services-ait.dev.dm-ai.cn/',
        target: 'https://ait-tutor-board-ait.dev.dm-ai.cn/',
        changeOrigin: true
    },
    // '/api/pg': {
    //     target: 'https://ait-eaog-runner-svc-ait.dev.dm-ai.cn',
    //     changeOrigin: true
    // }
    '/api/pg': {
      target: 'http://sci-test-proxy-svc.dev.dm-ai.cn/ait-eaog-runner-tencent-demo-svc.ait',
      changeOrigin: true
  }
};
