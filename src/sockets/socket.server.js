const { Server } = require('socket.io')
const cookie = require('cookie')
const jwt = require('jsonwebtoken')
const userModel = require('../models/user.model')
const aiService = require('../services/ai.service')
const messageModel = require('../models/message.model')
const { queryMemory, createMemory } = require('../services/vector.service')

function initSocketServer(httpServer) {

  const io = new Server(httpServer, {})

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "")

    if (!cookies.token) {
      return next(new Error('Unauthorized'))
    }

    const token = cookies.token

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET)
      const user = await userModel.findById(decoded.id)
      socket.user = user
      next()

    } catch (error) {
      return next(new Error('Authentication error invalid token'))
    }

  })

  io.on('connection', (socket) => {
    console.log('a user connected', socket.id)

    socket.on('disconnect', () => {
      console.log('a user disconnected', socket.id)
    })


    socket.on('ai-message', async (messagePayload) => {
      console.log('Received AI message:', messagePayload)


      // user message save in DB & generate vectors & save user message in pinecone
      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: messagePayload.content,
          role: 'user'
        }),
        aiService.generateVector(messagePayload.content),
      ])

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      })

      // query memory and get chat history from the DB
      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id
          }
        }),
        messageModel.find({
          chat: messagePayload.chat
        }).sort({ createdAt: -1 }).limit(20).lean().then(messages => messages.reverse())
      ])

      const stm = chatHistory.map(item => {
        return {
          role: item.role,
          parts: [{ text: item.content }]
        }
      })

      const ltm = [
        {
          role: 'user',
          parts: [{
            text: `
            these are some previous messages from the chat, use them to generate  a response
            ${memory.map(item => item.metadata.text).join('\n')}
            `}]
        }
      ]


      const response = await aiService.generateResponse([...ltm, ...stm])

      socket.emit('ai-response', {
        content: response,
        chat: messagePayload.chat,
      })
      console.log('AI response sent:', response)

      // save AI response in DB & generate vectors & save AI response in pinecone
      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: 'model'
        }),
        aiService.generateVector(response)
      ])

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response
        }
      })

    })

  })


}

module.exports = initSocketServer











