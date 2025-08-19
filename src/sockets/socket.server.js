const {Server} = require('socket.io')

function initSocketServer(httpServer) {

  const io = new Server(httpServer,{})

  io.on('connection',(socket) => {
    console.log('a user connected', socket.id)

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id)
    })
    
  })


}

module.exports = initSocketServer 
