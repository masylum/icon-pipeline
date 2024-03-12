export function svgoConfig() {
  return {
    plugins: [
      {
        name: "preset-default",
      },
      {
        removeAttrs: {
          attrs: "*:(stroke|fill):((?!^none$).)*",
        },
      },
    ],
  };
}
