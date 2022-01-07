<template>
    <div>
        <div id="map-wrap" style="height: 50vh; width: 100%;">
            <no-ssr>
                <l-map :zoom="13" :center="[47.413220, -1.219482]">

                </l-map>
            </no-ssr>
        </div>
        <div id="wrap-map"></div>
    </div>
</template>


<script>
    export default {
        props: ['places'],
        mounted() {
            var coors = this.places[0].properties.mapsCoors.split(',')
            var mymap = L.map('map-wrap').setView(coors, 10)
            L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
            }).addTo(mymap);
            this.places.forEach(function(x) {
                var coor = x.properties.mapsCoors.split(',')
                var marker = L.marker([coor[0], coor[1]])
                marker.bindPopup(x.properties.name).openPopup()
                marker.addTo(mymap)
            })
        },
    }
</script>