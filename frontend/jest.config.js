module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  // Adicione isso para garantir que axios seja tratado como CommonJS:
  transformIgnorePatterns: [
    "/node_modules/(?!(axios)/)"
  ],
  moduleNameMapper: {
    // Caso use imports de css/img/svg
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  }
};
