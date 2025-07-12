import {useState} from 'react'
import '../Styles/InviteRoom.css'
// import Logo from '../Logo/mhmybfzt.png';
import Logo from '../../Logo/CodeSync.png'

export default function InviteRoom(props) {

    // Add this state near your other state declarations
    const [showShareModal, setShowShareModal] = useState(false);
    const [isLinkCopied, setIsLinkCopied] = useState(false);

    // Replace your current handleShareRoom with this:
    const handleShareRoom = () => {
    setShowShareModal(true);
    };

    const shareViaWhatsApp = () => {
        const text = `Join my coding room on :\n${window.location.origin}`;
        const RoomId = `My Room ID : ${props.roomId}`;
        const MainText = `${text}\n${RoomId}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(MainText)}`, '_blank');
    };

    const shareViaEmail = () => {
        const subject = "Join my coding room on ";
        const body = `Hi,\n\nJoin my coding room at: ${window.location.origin}\nMy Room Id Is: ${props.roomId}\n\nSee you there!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const shareViaTwitter = () => {
        const text = `Join my coding room on :\n${window.location.origin}`;
        const RoomId = `My Room ID : ${props.roomId}`;
        const MainText = `${text}\n${RoomId}`;    
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(MainText)}`, '_blank');
    };

    const handleShareRoomCopy = () => {

        setTimeout(() =>{
            setIsLinkCopied(false);
        } , 3000);

        const fullUrl = `${window.location.origin}`;
        const roomPath = `${fullUrl}\nRoom ID: ${props.roomId}`;
        navigator.clipboard.writeText(roomPath)
        .catch(() => props.setErrorMessage(prev => prev.some(e => e.message === "Failed to copy link.")
                        ? prev
                        : [...prev , {id: Date.now() , message:"Failed to copy link."}]
                        ));
    };

  return (
    <div>
        <div className="modal-backdrop fade show d-flex align-items-center justify-content-center">
          <div className='modal-content rounded-4 shadow-lg share-modal'>
            <div className='modal-header'>
                <button type='button ' onClick={() => props.SendDataToEditor(true)} className='btn-close btn-close-white p-2'></button>
            </div>
            <div className='modal-body'>
              <div className='d-flex justify-content-center'>
                <div className='p-0 d-flex flex-column justify-content-center modalBodyHeader'>
                    <div className='Logo-container'>
                        <img src={Logo} className='Logo' alt="" />
                    </div>
                    <pre className='text-light'> Invite Friends to CodeSync</pre>
                </div>
              </div>
              <div className='share-options'>
                <div className='d-flex justify-content-center mt-5'>
                    <input className='CopyText' type="text" defaultValue={window.location.origin} />
                    <button onClick={() => {setIsLinkCopied(true) ; handleShareRoomCopy();}} className={`CopyTextBtn ${isLinkCopied ? 'BtnActive' : 'NotBtnActive'}`} aria-readonly >
                        {isLinkCopied ? (
                            <>
                                <i className="bi bi-check-circle-fill me-2"></i>
                            </>
                            ) : (
                            <>
                                <i className="bi bi-clipboard me-2"></i>
                            </>
                        )}
                    </button>
                </div>
                <div className='d-flex flex-wrap gap-3 Button-Container'>
                    <button
                        className="share-option-btn"
                        onClick={shareViaWhatsApp}
                        style={{color:'green'}}
                        >
                        <i className="bi bi-whatsapp me-2"></i>
                    </button>
                    <button 
                        className="share-option-btn"
                        onClick={shareViaEmail}
                        style={{color:' rgb(181, 34, 34)'}}
                    >
                        <i className="bi bi-envelope me-2"></i>
                    </button>
                    <button 
                        className="share-option-btn"
                        onClick={shareViaTwitter}
                        style={{color:'rgb(0, 140, 255)'}}
                    >
                        <i className="bi bi-twitter me-2"></i>
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
