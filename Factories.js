const uuidv4 = require('uuid/v4');

const createUser = ({ name = '', socketId = null } = {}) => ({
  id: uuidv4(),
  name,
  socketId
});

const createMessage = ({ message = '', sender = '' } = {}) => ({
  id: uuidv4(),
  time: getTime(new Date(Date.now())),
  message,
  sender
});

const createChat = ({ messages = [], name = 'Community', users = [], isCommunity = false } = {}) => ({
  id: uuidv4(),
  name: isCommunity ? 'Community' : createChatNameFromUsers(users),
  messages,
  users,
  typingUsers: [],
  isCommunity
});

const getTime = date => {
  return `${date.getHours()}:${('0' + date.getMinutes()).slice(-2)}`;
};

const createChatNameFromUsers = (users, excludeUser = '') => {
  return users.filter(u => u !== excludeUser).join(' & ') || 'Empty Users';
};

module.exports = {
  createMessage,
  createChat,
  createUser,
  createChatNameFromUsers
};
