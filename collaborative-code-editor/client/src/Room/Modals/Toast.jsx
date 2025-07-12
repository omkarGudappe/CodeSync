import React from 'react';
import '../Styles/Toast.css';

export default function Toast({ toasts, onDismiss , CurrentUser }) {
  if (!toasts || toasts.length === 0) return null;

  const getToastContent = (toast) => {
    if (toast.type === 'file-created') {
      return (
        <div className="user-left-toast toast-file-created">
          <div className="toast-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M13 9V3.5L18.5 9M6 2C4.89 2 4 2.89 4 4V20C4 21.11 4.89 22 6 22H18C19.11 22 20 21.11 20 20V8L14 2H6Z" />
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title d-flex justify-content-between">
              <span className="filecreated-user-name">{toast.name}</span>
              <span className="toast-time">just now</span>
            </div>
            <div className="toast-message">
              Created new file: <span className="text-success">{toast.fileName}</span>
            </div>
          </div>
          <div className="Filecreate-RoomJoin-progress"></div> 
        </div>
      );
    } else if (toast.type === 'user-joined') {
      return (
        <div className="user-left-toast toast-file-created">
          <div className="toast-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title d-flex justify-content-between">
              <span className="filecreated-user-name">{toast.name}</span>
              <span className="toast-time">just now</span>
            </div>
            <div className="toast-message">
              Joined the room
            </div>
          </div>
          <div className="Filecreate-RoomJoin-progress"></div> 
        </div>
      );
    } else if (toast.type === 'user-left') {
      return (
        <div className="user-left-toast user-leaved">
          <div className="toast-icon">
            <i className="fas fa-user-slash"></i>
          </div>
          <div className="toast-content">
            <div className="toast-title"><span className='text-danger'>{toast.name}</span> left the room</div>
            <div className="toast-message">They can rejoin anytime with the room link</div>
          </div>
          <div className="toast-close" onClick={() => onDismiss(toast.id)}>
            <i className="fas fa-times"></i>
          </div>
          <div className="toast-progress"></div> 
        </div>
      );
    } else if(toast.type === 'file-delete') {
      return (
        <div className="user-left-toast user-leaved">
          <div className="toast-icon">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title d-flex justify-content-between">
              <span className="filecreated-user-name text-success">{toast.name}</span>
              <span className="toast-time">just now</span>
            </div>
            <div className="toast-message">
             <span className="text-danger">{toast.fileName}</span> This file was deleted
            </div>
          </div>
          <div className="toast-progress"></div> 
        </div>
      )
    }
    return null;
  };

  return (
    <div className="toast-container" id="toastContainer">
      {toasts
      .filter((toast) => toast.name !== CurrentUser)
      .map(toast => (
        <div 
          key={toast.id} 
          className="toast-wrapper"
          onAnimationEnd={() => {
            // Remove the toast after animation completes
            if (Date.now() - parseInt(toast.id) > 4500) {
              onDismiss(toast.id);
            }
          }}
        >
          {getToastContent(toast)}
        </div>
      ))}
    </div>
  );
}