
$(document).ready( function() {
  console.log("?");
  $("button#start").click( function() {
    var gamename = $("input[name=gamename]").val();
    var libId = $("select[name=lib]").val();
    // if (gamename !== "") {
    //   socket.emit('Create Game', {gamename: gamename, libId: libId});
    // }
    console.log(libId);
    console.log(gamename);
  })

})



socket.on('reload listeners', function() {
  reloadListeners();
})


function reloadListeners() {

  $("button#start").click( function() {
    var gamename = $("input[name=gamename]").val();
    var libId = $("select[name=lib]").val();
    console.log(libId);
    console.log(gamename);
  })

}

