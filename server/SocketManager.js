const io = require('./Server.js').io;
const UserController = require('./controllers/UserController');

const {
  COMMUNITY_CHAT,
  USER_CONNECT,
  USER_DISCONNECT,
  MESSAGE_RECEIVE,
  MESSAGE_SEND,
  TYPING,
  REGISTER_USER,
  VERIFY_USER,
  LOGOUT,
  PRIVATE_MESSAGE,
  DESTROY,
  UPDATE_USER
} = require('../Events');

const { createUser, createMessage, createChat } = require('../Factories');

let connectedUsers = {};

let communityChat = createChat({ isCommunity: true });

module.exports = function(socket) {
  console.log('SocketId', socket.id);

  let sendMessageToChatFromUser;
  let sendTypingFromUser;

  socket.on(VERIFY_USER, (email, password, callback) => {
    let user = UserController.show(email, password);
    user.then(result => {
      if (result.code) {
        callback({ response: result, isUser: false });
      } else {
        callback({ response: result, isUser: true });
      }
    });
  });

  socket.on(REGISTER_USER, (email, username, address, phone, password, callback) => {
    let user = UserController.store(email, username, address, phone, password);
    user.then(result => {
      if (result.code) {
        callback({ response: result, registeredUser: true });
      } else {
        callback({ response: result, registeredUser: false });
      }
    });
  });

  socket.on(USER_CONNECT, user => {
    user.socketId = socket.id;
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

    sendMessageToChatFromUser = sendMessageToChat(user.username);
    sendTypingFromUser = sendTypingToChat(user.username);

    io.emit(USER_CONNECT, connectedUsers);
  });

  socket.on('disconnect', () => {
    if ('user' in socket) {
      console.log(socket.user.username, 'Has been disconnected from the chat');
      connectedUsers = removeUser(connectedUsers, socket.user.username);
      io.emit(USER_DISCONNECT, connectedUsers);
    }
  });

  socket.on(LOGOUT, () => {
    connectedUsers = removeUser(connectedUsers, socket.user.email);
    io.emit(USER_DISCONNECT, connectedUsers);
    console.log('Disconnect', socket.user.email);
  });

  socket.on(COMMUNITY_CHAT, callback => {
    callback(communityChat);
  });

  socket.on(MESSAGE_SEND, ({ chatId, message }) => {
    sendMessageToChatFromUser(chatId, message);
  });

  socket.on(TYPING, ({ chatId, isTyping }) => {
    sendTypingFromUser(chatId, isTyping);
  });

  socket.on(PRIVATE_MESSAGE, ({ receiver, sender, activeChat }) => {
    if (receiver in connectedUsers) {
      const receiverSocket = connectedUsers[receiver].socketId;
      if (activeChat === null || activeChat.id === communityChat.id) {
        const newChat = createChat({ name: `${receiver} & ${sender}`, users: [receiver, sender] });
        socket.to(receiverSocket).emit(PRIVATE_MESSAGE, newChat);
        socket.emit(PRIVATE_MESSAGE, newChat);
      } else {
        socket.to(receiverSocket).emit(PRIVATE_MESSAGE, activeChat);
      }
    }
  });

  socket.on(DESTROY, ({ email }) => {
    return UserController.destroy(email);
  });

  socket.on(UPDATE_USER, ({ id, email, username, address, phone, password }) => {
    return UserController.update(id, email, username, address, phone, password);
  });
};

function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping });
  };
}

function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(`${MESSAGE_RECEIVE}-${chatId}`, createMessage({ message, sender }));
  };
}

function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  newList[user.username] = user;
  return newList;
}

function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  return newList;
}

function isUser(userList, username) {
  return username in userList;
}
