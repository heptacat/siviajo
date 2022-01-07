<template>

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <nuxt-link class="navbar-brand ml-3" style="font-size: 28px !important" to="/">𝕊í 𝕍𝕚𝕒𝕛𝕠</nuxt-link>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse ml-3" id="navbarSupportedContent">
            <nuxt-link class="nav-link" to="/bodegas/populares/1">Bodegas</nuxt-link>
            <nuxt-link class="nav-link" :to="`/rutas/${loggedInUser}`">Rutas</nuxt-link>
            <ul class="navbar-nav ml-auto">
                <li class="nav-item dropdown" v-if="isAuthenticated">
                    <a class="nav-link dropdown-toggle" style="margin-right:90px;" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {{ loggedInUser }}
                    </a>
                    <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <a class="dropdown-item" @click="logout">Cerrar sesión</a>
                    </div>
                </li>
                <template v-if="!isAuthenticated">
                    <nuxt-link class="nav-link" to="/register">Register</nuxt-link>
                    <nuxt-link class="nav-link" to="/login">Log In</nuxt-link>
                </template>
            </ul>
        </div>
    </nav>
</template>



<script>
    import {
        mapState
    } from 'vuex'
    export default {
        methods: {
            async logout() {
                this.$store.commit('logout')
                this.$router.push('/')
            },
        },
        computed: {
            ...mapState([
                'isAuthenticated',
                'loggedInUser',
            ])
        },
    }
</script>