function run() {

    var artist = "drake";

    $.ajax({
        url: 'https://itunes.apple.com/search?term=' + artist,
        dataType: "json",
        success: process
    });
}

function process(data) {
    console.log(data)

    var songs = data.results;
    var o = "";

    for(var p=0;p<songs.length;p++) {
        o += "<tr>";
        o += "<td>" + songs[p].trackName + "</td>";
        o += "<td>" + songs[p].collectionName + "</td>";
        o += "</tr>";
    }

    var table = document.getElementById("output");
    table.innerHTML = o;
    table.style.display = "block";

}
