import React , {useState , useEffect} from 'react'

export default function KickedUserModal({Kicked , CountDown, setCountDown }) {
    

    useEffect(()=>{
    const timer = setInterval(()=>{
        setCountDown((prev) => prev - 1)
    } , 1000)

    return () => clearInterval(timer);
    } , [CountDown])

  return (
    <div className={`${Kicked ? 'show' : ''} modal fade custom-modal`} style={{display:'block' , zIndex:9999}} id="dangerModal" tabindex="-1" >
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header text-center d-block">
                    <div className="modal-icon danger-icon">
                        <i className="bi bi-exclamation-octagon-fill"></i>
                    </div>
                    <h3 className="modal-title w-100">Sorray for a reason</h3>
                </div>
                <div className="modal-body text-center py-4">
                    <p>You have been kicked from the room by the admin.</p>
                    <pre>Redirecting to home page in {CountDown}</pre>
                </div>
            </div>
        </div>
    </div>
  )
}
