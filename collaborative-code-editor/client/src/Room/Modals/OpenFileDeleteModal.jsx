import React from 'react'
import socket from "../../SocketClient/socket"; 

export default function OpenFileDeleteModal({ OpenDeleteFileModalStatus , CloseFileDeleteModal , SetNewActiveFile , FileDeleteName }) {

    const handleDeleteFile = () => {
        SetNewActiveFile(FileDeleteName)
        CloseFileDeleteModal(false)
    }

  return (
   <div className={`modal fade ${OpenDeleteFileModalStatus ? 'show' : ''} custom-modal`} style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)",zIndex:9999}} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header text-center d-block">
                    <div className="modal-icon warning-icon">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                    </div>
                    <h3 className="modal-title w-100">Warning</h3>
                </div>
                <div className="modal-body text-center py-4">
                    <p>Are you sure you want to delete this file: "{FileDeleteName}"?</p>
                </div>
                <div className="modal-footer LeaveBTN">
                    <button type="button" onClick={() => CloseFileDeleteModal(false)} className="btn btn-cancel modal-btn me-3" data-bs-dismiss="modal">No</button>
                    <button type="button" onClick={handleDeleteFile} className="btn btn-warning modal-btn">Yes</button>
                </div>
            </div>
        </div>
    </div>
  )
}
