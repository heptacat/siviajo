<template>
    <div>
        <div class="row">
            <div class="col-4 offset-4 my-5">
                <Notification :message="error" v-if="error" />
                <h1 class="h3 mt-5 text-center">REGÍSTRATE</h1>
                <form method="post" @submit.prevent="register">
                    <div class="form-group">
                        <label for="username">Nombre de usuario:</label>
                        <input v-model="username" type="text" class="form-control" id="username" placeholder="Elige un nombre de usuario">
                    </div>
                    <div class="form-group">
                        <label for="email">Dirección email:</label>
                        <input v-model="email" type="email" class="form-control" id="email" placeholder="Introduce tu email">
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña:</label>
                        <input v-model="password" type="password" class="form-control" id="password" placeholder="Password">
                    </div>
                    <button type="submit" class="btn btn-primary">Registrarse</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
    import Notification from '~/components/Notification'

    export default {
        components: {
            Notification,
        },
        data() {
            return {
                username: '',
                email: '',
                password: '',
                error: null
            }
        },
        methods: {
            async register($api) {
                try {
                    const user = await this.$api.register(this.username, this.email, this.password)
                    if (user != false) {
                        this.$store.commit('login', this.username)
                        this.$router.push('/')
                    }
                } catch (e) {
                    console.log(e)
                    this.error = 'error'
                }
            },
        }
    }
</script>