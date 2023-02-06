function run() {

    var artist = "drake";

    $.ajax({
        url: 'https://itunes.apple.com/search?media=music&term=' + artist,
        dataType: "json",
        success: process
    });
}

function process(data) {
    
    console.log(data)
    
}
