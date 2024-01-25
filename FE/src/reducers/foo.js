let initialState = 'has-bottom-nav fixed-top-nav'
export default (state = initialState, action) => {
  switch (action.type) {
    case 'FOO':
      return action.data
    default:
      break
  }
  return state
}
