import React from 'react';

// ChatResults Component
const ChatResults = ({ messages = [] }) => {
  return (
    <div className="w-full bg-gray-100 rounded-lg shadow-md p-4 overflow-y-auto max-h-96">
      {Array.isArray(messages) && messages.length > 0 ? (
        messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 my-2 rounded-lg ${
              message.isUser ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {message.text}
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center">No messages yet. Start the conversation!</div>
      )}
    </div>
  );
};

export default ChatResults;
