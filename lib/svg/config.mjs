export function svgoConfig() {
  return {
    plugins: [
      {
        name: "preset-default",
      },
      {
        name: "removeAttrs",
        params: {
          attrs: "*:(stroke|fill):((?!^none$).)*",
        },
      },
    ],
  };
}
