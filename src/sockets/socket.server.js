const {Server} = require('socket.io')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const aiService = require('../services/ai.service')
const messageModel = require('../models/message.model')

function initSocketServer(httpServer) {

  const io = new Server(httpServer,{})

  io.use(async(socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "") 
    
    if(!cookies.token){
      return next(new Error('Unauthorized'))
    }

    const token = cookies.token

    try {
      const decoded =  jwt.verify(cookies.token, process.env.JWT_SECRET)
      const user  = await userModel.findById(decoded.id)
      socket.user = user
      next()

    } catch (error) {
      return next(new Error('Authentication error invalid token'))
    }

  })

  io.on('connection',(socket) => {
    console.log('a user connected', socket.id)

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id)
    })


    socket.on('ai-message',async(messagePayload)=>{
      console.log('Received AI message:', messagePayload)


      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: 'user'
      })

      const chatHistory = (await messageModel.find({
        chat: messagePayload.chat
      }).sort({createdAt:-1}).limit(10).lean()).reverse()

      

      const response = await aiService.generateResponse(chatHistory.map(item=>{
        return{
          role:item.role,
          parts:[{text: item.content}]
        }
      }))

      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: 'model'
      })
      
      socket.emit('ai-response', {
        content: response,
        chat: messagePayload.chat,
      })
      console.log('AI response sent:', response)  

    })
    
  })


}

module.exports = initSocketServer 
