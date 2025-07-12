import React from 'react'

export default function RoomDeleteModel({OpenRoomDeleteModel , HandleDeleteRoom , CloseRoomDeleteModel , RoomIdToDelete}) {
  return (
    <div className={`${OpenRoomDeleteModel ? 'show' : ''} modal fade custom-modal`} style={{display:'block' , zIndex:9999}} id="dangerModal" tabindex="-1" >
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header text-center d-block">
                    <div className="modal-icon danger-icon">
                        <i className="bi bi-exclamation-octagon-fill"></i>
                    </div>
                    <h3 className="modal-title w-100"></h3>
                </div>
                <div className="modal-body text-center py-4">
                    <p>Are you sure. If you delete room then all the data from that room will be deleted also</p>
                </div>
                <div className="modal-footer LeaveBTN">
                    <button type="button" onClick={() => CloseRoomDeleteModel(false)} className="btn btn-cancel modal-btn me-3" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" onClick={()=>HandleDeleteRoom(RoomIdToDelete)} className="btn btn-danger modal-btn">Delete</button>
                </div>
            </div>
        </div>
    </div>
  )
}
