export const getFoo = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    data: {
      foo: 'bar'
    },
    status: 200,
  }
}
