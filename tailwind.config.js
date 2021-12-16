module.exports = {
  content: ["./index.html", "./js/main.js"],
  theme: {
    fontFamily: {
      "mono": ["Space Grotesk", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"]
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
