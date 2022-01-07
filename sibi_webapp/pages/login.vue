<template>
    <div>
        <div class="row">
            <div class="col-4 offset-4 my-5">

                <!-- centrado 4cols -->
                <Notification :message="error" v-if="error" />
                <h1 class="h3 mt-5 text-center">INICIA SESIÓN</h1>
                <form method="post" @submit.prevent="login">
                    <div class="form-group">
                        <label for="email">Dirección email:</label>
                        <input v-model="email" type="email" class="form-control" id="email" placeholder="Introduce tu email">
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña:</label>
                        <input v-model="password" type="password" class="form-control" id="password" placeholder="Password">
                    </div>
                    <button type="submit" class="btn btn-primary">Iniciar sesión</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import Notification from '~/components/Notification'
    import Vuex from 'vuex'
    import axios from 'axios'

    export default {

        components: {
            Notification,
        },

        data() {
            return {
                email: '',
                password: '',
                error: null
            }
        },

        methods: {
            async login($api) {
                try {
                    const user = await this.$api.logIn(email, password)
                    if (user.data.username != false && user.data.username != "") {
                        this.$store.commit('login', user.data.username)
                        this.$router.push('/')
                    } else {
                        this.error = 'Revisa los datos introducidos'
                    }
                } catch (e) {
                    console.log(e)
                    this.error = 'error' //e.response.data.message
                }
            },
        }
    }
</script>