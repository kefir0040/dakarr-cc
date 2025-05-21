let teams = ran.choose([2,4]), room = ['map_apspp_default'];
if (teams === 4) {
    room.push('overlay_tdm')
} else if (teams === 2) {
    room.push('map_2tdm_default', 'overlay_tdm');
}
console.log("Map TDM loaded with " + teams + " teams.")
module.exports = {
    MODE: "tdm",
    TEAMS: teams,
    TILE_WIDTH: 800,
    TILE_HEIGHT: 800,
    FOOD_CAP_NEST: 3,
    FOOD_SPAWN_COOLDOWN_NEST: 20,
    ROOM_SETUP: room,
};
