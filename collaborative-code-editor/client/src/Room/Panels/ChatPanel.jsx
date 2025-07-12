import React from 'react'

export default function ChatPanel({
  isChatOpen,
  setIsChatOpen,
  chatUnreadCount,
  chatMessage,
  chatInput,
  setChatInput,
  sendChatMessage,
  activeUsers,
  userName,
  PanelRef,
}) {
  return (
      <div className="offcanvas offcanvas-end ChatPanal bg-dark text-light" data-bs-scroll='true' data-bs-backdrop="false" tabIndex='-1' id="offcanvasRight" aria-labelledby="offcanvasRightLabel">
          <div className="offcanvas-header">
            <div className="d-flex align-items-center">
              <i className="bi bi-chat-square-text-fill me-2" style={{color: '#0ff'}}></i>
              <h5 className="offcanvas-title mb-0" id="offcanvasRightLabel">
                Developer Chat
                {chatUnreadCount > 0 && (
                  <span className="badge bg-danger ms-2">{chatUnreadCount}</span>
                )}
              </h5>
            </div>
            <button className="btn-close btn-close-white" type="button" onClick={()=>setIsChatOpen(false)} data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>

          {/* Online User */}
          <div className="online-users">
            <div className="d-flex align-items-center"> 
               {activeUsers.slice(0,3).map((user , i) => (
                  <div key={i} className='user-avatar'          
                    style={{
                      background: `hsl(${(i * 137) % 360}, 70%, 60%)`,
                      marginLeft: i > 0 ? '-10px' : '0',
                      zIndex: 3 - i,
                      border: '2px solid #1e1e1e'
                    }}
                    title={user.name}
                  >
                       {user.name?.charAt(0).toUpperCase()}
                  </div>
               ))}
                {activeUsers.length > 3 && (
                  <div className="user-avatar" style={{background: '#444'}}>
                    +{activeUsers.length - 3}
                  </div>
                )}
            </div>
            <div className="user-count">
              {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
            </div>
          </div>
          {/* Messages Container */}
          <div className="chatMsg">
            {chatMessage.length === 0 ? (
              <div className="empty-chat">
                <i className="bi bi-chat-square-text empty-chat-icon"></i>
                <h6>No messages yet</h6>
                <p>Start the conversation with your:</p>
                <pre>Developers</pre>
              </div>
            ) : (
              chatMessage.map((msg, index) => {
                const isMe = msg.name === userName;
                const isSameSender = index > 0 && chatMessage[index - 1].name === msg.name;
                const showTime = index === chatMessage.length - 1 || 
                  chatMessage[index + 1].name !== msg.name ||
                  new Date(chatMessage[index + 1].timestamp) - new Date(msg.timestamp) > 300000;
                return (
                  <div 
                    key={index}
                    className={`message-container ${isMe ? 'you' : 'others'}`}
                  >
                    {!isSameSender && (
                      <div className="message-sender">
                        {msg.name} {isMe && '(You)'}
                      </div>
                    )}
                    <div className={`message-bubble ${isMe ? 'you' : 'others'}`}>
                      {msg.message}
                    </div>
                    {showTime && (
                      <div className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          
          {/* Chat Input */}
          <div className="chat-input-container">
            <div className="chat-input-group">
              <input
                ref={PanelRef}
                type="text"
                className="chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                maxLength="500"
              />
              <button
                className="send-button"
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
            <div className="chat-meta">
              <span>Press Enter to send</span>
              <span>{chatInput.length}/500</span>
            </div>
          </div>
        </div>
  )
}
