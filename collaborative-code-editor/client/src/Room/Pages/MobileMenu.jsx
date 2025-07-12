import React from 'react'
import socket from "../../SocketClient/socket";

export default function MobileMenu(props) {
   const {roomId , user} = props

    const stringToColor = (str) => {
        if (!str || typeof str !== "string") return "hsl(0, 0%, 50%)"; 
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 70%, 60%)`;
    };
    
  return (
    <div className="dropdown menu" >
        <button
            className="Mobile-menu"
            type="button"
            id="mainDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-bs-auto-close="outside"
        >
            <i className="bi bi-three-dots-vertical "></i>
        </button>

        <ul className="dropdown-menu mobile-dropMenu bg-dark text-light p-1" aria-labelledby="mainDropdown" id="mainDropdownMenu">
        <li  className='p-0 m-0'>
            <button 
                className="dropdown-item align-item-center justify-content-center text-light d-flex gap-2" 
                style={{ background: "transparent" , width:'100%' }}
                // onClick={handleShareRoom}
                onClick={() => props.ShareRoomModalOpen(true)}
            >
                <i className="bi bi-share-fill"></i>
                <span>Invite In Room</span>
            </button>
        </li>

        <li className="dropdown-submenu p-0 m-0 submenu-item">
            <div className="btn-group MenuBTN">
                <button
                    type="button"
                    className="dropdown-item dropdown-toggle w-100"
                    data-bs-toggle="dropdown"
                    style={{background:"transparent"}}
                >
                    <span>
                        Active Users ({props.activeUsers.length})
                    </span>
                </button>
                <ul 
                    className="dropdown-menu showMenu bg-dark" 
                    style={{
                        minWidth: '16rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 0.5rem 1rem rgba(0,0,0,0.3)',
                        borderRadius: '0.5rem',
                        overflow: 'hidden'
                    }
                }>
                    <li 
                        className="dropdown-header d-flex align-items-center px-3 py-2" 
                        style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <i className="bi bi-person-check-fill me-2 text-success"></i>
                        <span className="text-light">Currently Online</span>
                    </li>
                    {[...new Map(props.activeUsers.map(user => [user.id, user])).values()].map((user) => (
                        <li 
                            key={user.id} 
                            className="d-flex align-items-center justify-content-between px-3 py-2" 
                            style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <div 
                                    className="user-avatar me-2" 
                                    style={{
                                        width: '2rem',
                                        height: '2rem',
                                        borderRadius: '50%',
                                        background: `linear-gradient(135deg, ${stringToColor(user.name)} 0%, ${stringToColor(user.name + '2')} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {/* {user.name.charAt(0).toUpperCase()} */}
                                    {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span 
                                    className="text-light" 
                                    style={{
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '10rem'
                                        
                                    }}
                                >
                                    {user.name}
                                    {user.name === props.admin && (
                                        <span className="badge bg-warning text-dark ms-2">Admin</span>
                                    )}
                                </span>
                            </div>
                            {props.isCreator && user.name !== props.admin && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        socket.emit("remove-user", {roomId, userId: user.id});
                                    }} 
                                    className="btn btn-sm btn-outline-danger"
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '50%',
                                        width: '1.8rem',
                                        height: '1.8rem'
                                    }}
                                    title="Kick User"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </li>

        <li className="p-0 m-0" style={{width:'100%'}}>
            <button className='btn IDownloadFile MenuBTN  d-flex gap-1' onClick={()=>props.OpenDownloadFilesModal(true)} style={{background:'transparent'}}>
            <i className="bi bi-download"></i>
            <span>Download_Files</span>
            </button>
        </li>

        {!user && 
        <li className="p-0 m-0">
            <button className='btn SignInModal MenuBTN d-flex gap-1' onClick={() =>props.OpenSignInModal(true)}>
            <i className="bi bi-box-arrow-in-right"></i>
            <span>Sign In</span>
            </button>
        </li>}

        <li className='p-0 m-0'>
            <button
              onClick={()=>props.OpenFeedbackModel()}
              className='btn d-flex gap-1 MenuBTN'
            >
                <i className="fa-solid fa-comment-dots"></i>
                <span>Feedback</span>
            </button>
        </li>

        <li className="p-0 m-0" style={{ width: "100%" }}>
            <button 
            className="I-Leavebtn MenuBTN  d-flex gap-1" 
            style={{ background: "transparent" }} 
            onClick={props.ShowLeaveRoomModal}
            >
            <i className="bi bi-door-open-fill"></i>
            <span>Leave Room</span>
            </button>
        </li>
        </ul>
    </div>
  )
}
