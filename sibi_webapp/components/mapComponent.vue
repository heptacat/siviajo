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
    props: ['coors'],
    mounted() {
        var coor = this.coors.split(',')
        console.log(coor)
        var mymap = L.map('map-wrap').setView([coor[0], coor[1]], 13)
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
        }).addTo(mymap);
        L.marker([coor[0], coor[1]]).addTo(mymap)
    },
	}
</script>