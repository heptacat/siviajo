<template>
    <div>
        <div class="container">
            <div class="my-3 p-3 bg-white rounded box-shadow">
                <div class="text-right">
                    <img :src="`${place[1].properties.logoUrl}`" class="pic">
                </div>
                <h1>{{place[1].properties.name}}</h1>
                <kbd v-for="item in place.labels" :key="item.message" class="mr-2">
                    {{item.split(/(?=[A-Z])/).join(' ')}}
                </kbd>
                <div>
                    <h6 class="border-bottom border-gray pb-2 mb-0">{{place[1].properties.destination}}</h6>
                    <div class="row">
                        <div class="col">
                            <img :src="`${place[1].properties.photoUrl}`" class="pic">
                        </div>
                        <div class="col">
                            <p v-if="place[1].properties.destination != ''" class="mt-3"><b>Región:</b><br>{{place[1].properties.destination}}</p>
                            <p v-if="place[1].properties.contact != ''"><b>Información de contacto:</b><br>{{place[1].properties.website}}</p>
                            <p v-if="place[1].properties.website != ''"><b>Página web:</b><br>
                                <a :href="(place[1].properties.website.startsWith('http') ? place[1].properties.website: 'https://'+place[1].properties.website)">
                                    {{place[1].properties.website}}</a>
                            </p>
                        </div>
                        <svg v-if="!fav && isAuthenticated" @click='switchfav()' xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="goldenrod" class="bi bi-star mt-3 mr-5" viewBox="0 0 16 16">
                            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
                        </svg>
                        <svg v-if="fav && isAuthenticated" @click='switchfav()' xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="goldenrod" class="bi bi-star-fill mt-3 mr-5" viewBox="0 0 16 16">
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>
                    </div>
                    <p v-if="place[1].properties.schedule != ''"><b>Horario:</b><br>{{place[1].properties.schedule}}</p>
                    <p v-if="place[1].properties.description != ''" class="text-justify"><b>Descripción:</b><br>{{place[1].properties.description}}</p>
                    <p v-if="place[1].properties.additionalInfo != ''" class="text-justify"><b>Información adicional:</b><br>{{place[1].properties.additionalInfo}}</p>
                    <div v-if="place[1].properties.mapsCoors != ''" class="mt-5">
                        <h3>Ubicación</h3>
                        <map-component :coors="place[1].properties.mapsCoors" />
                    </div>
                </div>
                <div class="pt-3" v-if="place[2] != undefined && place[2].length > 0">
                    <h3>Carta de vinos</h3>
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col">Nombre</th>
                                <th scope="col">Denominación de origen</th>
                                <th scope="col">Tipo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="wine in place[2]" :key="wine.name">
                                <td>{{wine.properties.name}}</td>
                                <td>{{wine.properties.do}}</td>
                                <td>{{wine.properties.type}}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-if="place[3] != undefined && place[3].length > 0">
                    <div class="container mt-5">
                        <div class="row justify-content-center">
                            <div class="col-12">
                                <div class="headings d-flex justify-content-between align-items-center mb-3">
                                    <h3>Reseñas</h3>
                                </div>
                                <div v-for="review in place[3]" :key="review" class="card p-3 mt-2 bg-light">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="user d-flex flex-row align-items-center">
                                            <span>
                                                <small class="font-weight-bold text-primary">{{review.properties.author}}</small>
                                            </span>
                                        </div>
                                        <small>Puntuación: {{review.properties.rate.low}} sobre 5</small>
                                    </div>
                                    <div class="action d-flex justify-content-between mt-2 align-items-center">
                                        <div class="reply px-4"> {{review.properties.review}}
                                            <div class="icons align-items-center"> <i class="fa fa-star text-warning"></i> <i class="fa fa-check-circle-o check-icon"></i> </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h3>Sitios cercanos</h3>
            <VueSlickCarousel :arrows="true" v-bind="settings" :dots="true" class="row mb-5">
                <div v-for="place in closerPlaces" :key="place.name" class="col-12">
                    <router-link :to="`/place/${place[1].properties.name}`">
                        <div class="card bg-light mt-4">
                            <img :src="`${place[1].properties.photoUrl}`" class="card-img" alt="No hay imagen">
                            <div class="card-body">
                                <h5 class="card-title">{{place[1].properties.name}}</h5>
                                <p class="card-text"><small class="text-muted">{{place[1].properties.destination}}</small></p>
                            </div>
                        </div>
                    </router-link>
                </div>
            </VueSlickCarousel>
        </div>
    </div>
</template>

<style>
    .pic {
        max-width: 80%;
    }
</style>


<script>
    import VueSlickCarousel from 'vue-slick-carousel'
    // import axios from 'axios'
    import {
        mapState
    } from 'vuex'


    export default {
        components: {
            VueSlickCarousel
        },
        data() {
            return {
                fav: false,
                settings: {
                    "dots": true,
                    "infinite": false,
                    "initialSlide": 2,
                    "speed": 500,
                    "slidesToShow": 3,
                    "slidesToScroll": 1,
                    "swipeToSlide": true,
                    "rows": 1
                },
            }
        },
        async created() {
            this.fav = await this.$api.getFav(this.place[1].properties.name, this.loggedInUser)
        },
        computed: {
            ...mapState([
                'isAuthenticated',
                'loggedInUser',
            ])
        },
        methods: {
            switchfav() {
                this.fav = !this.fav
                this.$api.switchfav(this.fav, this.place[1].properties.name, this.loggedInUser)
            }
        },
        async asyncData({
            params,
            $api
        }) {
            const place = await $api.getPlace(params.name)
            place[1].labels.splice(place[1].labels.indexOf('Place'), 1)
            const closerPlacesNames = await $api.getCloserPlaces(10, place[1].properties.mapsCoors, 'Place')
            let closerPlaces = []
            for (var i = 0; i < closerPlacesNames.length; i++) {
                closerPlaces.push(await $api.getPlace(closerPlacesNames[i]))
            }

            return {
                place,
                closerPlaces
            }

        }

    }
</script>