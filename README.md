
# MultiLib
*by Angela M Liu for 67-328 Mobile to Cloud; F14 CMU*

MultiLIB is a multiplayer web game application that takes the fun of mad libs, online! One host player views a short story with blanks. The blanks will indicate what type of word needs to be filled in. A noun, pronoun, adjective, verb, you name it. For each blank the host asks the non host players for a word. Everyone comes up with a word, the host chooses his/her favorite, and then the group moves on to the next. Once all blanks are filled, the completed lib is shown to all players! And one game is done.

---

### Behind the scenes
Essenially a single page web application that uses node.js, express, and socket.io extensively. Other tools used are mongoDB, font awesome, the usual frontend tech (html, css, js), and the like. Adding new lib templates are currently being handled serverside, you can modify the file 'libTemplates.json' and follow the format of the currently inserted templates. This requires restarting the server. Adding new word slot types can be done in app.js, where all of server sockets are being handled, in a socket listening for the client fired event 'slot handler.' This game requires mongoDB to be set up.

This is a single page app that essentially uses socket.io to send events between the client and socket that dictate different 'screens' within the application. The pattern is generally where client sockets clear and update content within a main div, and server sockets respond to client requests and pass back relevant data.


### Resources used
* [Exporting modules](http://www.sitepoint.com/understanding-module-exports-exports-node-js/)

* [Getting clients in a room](http://stackoverflow.com/questions/6563885/socket-io-how-do-i-get-a-list-of-connected-sockets-clients)

* [Sending a message by socket id](https://github.com/Automattic/socket.io/issues/1618)

* [Deleting by doc ID for node/MongoDB](http://stackoverflow.com/questions/10929443/nodejs-mongodb-getting-data-from-collection-with-findone)