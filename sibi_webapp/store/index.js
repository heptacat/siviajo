export const state = () => ({
    isAuthenticated: false,
    loggedInUser: '',
})

export const mutations = {
    login(state, username) {
        state.isAuthenticated = true
        state.loggedInUser = username
    },
    logout(state) {
        state.isAuthenticated = false
        state.loggedInUser = ''
    },
}

export const getters = {
    isAuthenticated: (state) => {
        return state.isAuthenticated
    },
    loggedInUser: (state) => {
        return state.loggedInUser
    }
}