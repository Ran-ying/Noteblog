
require("./app");

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的拒绝:', promise, '原因:', reason);
    // 这里可以记录更详细的诊断信息
});
