export default {
    components: true,
    head: {
        titleTemplate: 'Tourism %s',
        auth: {
            strategies: {
                local: {
                    endpoints: {
                        login: {
                            url: 'login',
                            method: 'post',
                            propertyName: 'data.token'
                        },
                        user: {
                            url: 'me',
                            method: 'get',
                            propertyName: 'data'
                        },
                        logout: false
                    }
                }
            }
        },
        link: [{
            rel: "stylesheet",
            href: "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css",
            integrity: "sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh",
            crossorigin: "anonymous"
        }],
        script: [{
                src: "https://code.jquery.com/jquery-3.4.1.slim.min.js"
            },
            {
                src: "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
            },
            {
                src: "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
            }
        ]
    },
    meta: [{
        charset: 'utf-8'
    }],
    modules: [
        'nuxt-leaflet',
        ['nuxt-leaflet', {}],
        '@nuxtjs/axios',
        '@nuxtjs/auth',
    ],
    axios: {
        proxy: true
    },
    plugins: [{
            src: '~plugins/leaflet.js',
            ssr: false
        },
        '~/plugins/api',
        '~/plugins/persistedState.client.js',
    ],
}