export function svgoConfig() {
  return {
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeAttrs: {
              attrs: "*:(stroke|fill):((?!^none$).)*",
            },
          },
        },
      },
    ],
  };
}
