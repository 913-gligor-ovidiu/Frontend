const subscribers = {};

export const subscribe = (event, callback) => {
  if (!subscribers[event]) {
    subscribers[event] = [];
  }
  subscribers[event].push(callback);
  return () => {
    subscribers[event] = subscribers[event].filter(sub => sub !== callback);
  };
};

export const publish = (event, data) => {
  if (subscribers[event]) {
    subscribers[event].forEach(callback => callback(data));
  }
};

