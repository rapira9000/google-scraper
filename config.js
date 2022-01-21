const port = 3000;

module.exports = {
    port: port,
    googleClientID: "623186151295-tmljhhv7fiomdi32s2i7a2egtqfler01.apps.googleusercontent.com",
    googleClientSecret: "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",
    googleCallbackURL: `http://localhost:${port}/google/callback`
};