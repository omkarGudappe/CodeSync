import React from 'react'
import { useNavigate } from "react-router-dom";
import socket from "../../SocketClient/socket";

export default function LeaveRoomModal({roomId , LeaveRoom , CloseLeaveRoomModal , userName}) {

    const navigate = useNavigate();

    const handleLeaveRoom = () => {
        localStorage.removeItem('Already')
        socket.emit("leave-room", { roomId, name: userName });
        navigate('/');
    }

  return (
    <div className={`modal fade ${LeaveRoom ? 'show' : ''} custom-modal`} style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)",zIndex:9999}} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header text-center d-block">
                    <div className="modal-icon warning-icon">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <h3 className="modal-title w-100">Important Notice</h3>
                </div>
                <div className="modal-body text-center py-4">
                    <p>Are you sure you want to leave this room ({roomId})?"</p>
                </div>
                <div className="modal-footer LeaveBTN">
                    <button type="button" onClick={() => CloseLeaveRoomModal(false)} className="btn btn-cancel modal-btn me-3" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" onClick={handleLeaveRoom} className="btn btn-warning modal-btn">Leave</button>
                </div>
            </div>
        </div>
    </div>
  )
}
