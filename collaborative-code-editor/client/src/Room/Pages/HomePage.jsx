import React , { useState , useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../Styles/HomePage.css'; 
import gsap from "gsap";
import { v4 as uuidv4 } from 'uuid';
import { useGSAP } from '@gsap/react'
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { SplitText } from "gsap/SplitText";
import socket from "../../SocketClient/socket";
import { auth } from "../../Auth/FireBaseAuth";
import { onAuthStateChanged } from "firebase/auth"; 
import NavBar from "./NavBar";
import TechBubbles from '../Styles/TechBubbles';
import { useSignIn } from './SignInContext'
import ShowError from '../Modals/ShowError';

gsap.registerPlugin(SplitText);

const HomePage = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [name , setName ] = useState("");
    const [status , setStatus] = useState(false)
    const [roomIdCheak , setRoomIdCheak] = useState(false);
    const [rejectStatus , setRejectStatus] = useState(false);
    const [authName , setAuthName] = useState('');
    const user = auth.currentUser;
    // const [userObj, setUserObj] = useState(null);
    const [cheackName , setCheakName] = useState(false);
    const [roomIdCheakProgress, setRoomIdCheakProgress] = useState(0);
    const [rejectStatusProgress, setRejectStatusProgress] = useState(0);
    const [cheackNameProgress, setCheackNameProgress] = useState(0);
    const [Kicked , setkicked] = useState(false);   
    const roomIdCheakProgressRef = useRef(null);
    const rejectStatusProgressRef = useRef(null);
    const cheackNameProgressRef = useRef(null);
    const [AdminNotResponce , setAdminNotResponce] = useState(false);
    const { setSignInG  , SignInG , authError , setAuthError , authSuccess , setAuthSuccess , userRoom, setUsersRooms } = useSignIn();
    const [errorMessage , setErrorMessage] = useState([]);

    const handleJoin = () =>{
        if(!roomId && !name) {
             setErrorMessage(prev => prev.some(e => e.message === "Room ID and name are required. Please enter the Room ID sent by your friend.")
              ? prev
              : [...prev , {id: Date.now() , message:"Room ID and name are required. Please enter the Room ID sent by your friend."}]
            );
            return;
        }else if(!roomId){
          setErrorMessage(prev => prev.some(e => e.message === "Room ID is required. Please enter the Room ID sent by your friend.")
              ? prev
              : [...prev , {id: Date.now() , message:"Room ID is required. Please enter the Room ID sent by your friend."}]
            );
          return
        }else if(!name){
           setErrorMessage(prev => prev.some(e => e.message === "Name is required. Please enter your name.")
              ? prev
              : [...prev , {id: Date.now() , message:"Name is required. Please enter your name."}]
            );
          return
        }
        setStatus(true);
        // navigate(`/editor/${roomId}?name=${encodeURIComponent(name)}`);
        socket.emit("join-room" , {roomId , name , isCreator:false});
    }

    const handleCreateRoom = async() => {

      const finalName = name || user?.displayName

        if (!finalName?.trim()) {
          setErrorMessage(prev => prev.some(e => e.message === "Name is required. Please enter your name.")
              ? prev
              : [...prev , {id: Date.now() , message:"Name is required. Please enter your name."}]
            );
          return;
        }
       
        const ROOMID = uuidv4().slice(0, 7);
        if(!finalName || !ROOMID) return;
        
        // socket.emit("join-room" , {roomId:ROOMID , finalName , isCreator:true});

        try{
          const res = await fetch("https://codesync-rqbm.onrender.com/api/allow-create" , {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ ROOMID })
          });

          const data = await res.json();

          if(data.allowed){
            socket.emit("join-room", {
              roomId: ROOMID,
              name: finalName,
              isCreator: true
            });
            navigate(`/editor/${ROOMID}?name=${encodeURIComponent(finalName)}&creator=1`);
          } else {
            alert("Room creation not authorized.");
          }
        }catch (err) {
          console.error("Create room error:", err);
          setErrorMessage(prev => prev.some(e => e.message === "Failed to create room. Try again.")
            ? prev
            : [...prev , {id: Date.now() , message:"Failed to create room. Try again."}]
          );
        }

        // navigate(`/editor/${ROOMID}?name=${name}&creator=1`);
    }


  useEffect(() => {
    socket.on("connect", () => {
    });
    return () => socket.off("connect");
  }, []);

  useEffect(()=> {
  if(!rejectStatus && !roomIdCheak && !cheackName) return;
  setRejectStatusProgress(0);
  setRoomIdCheakProgress(0);
  setCheackNameProgress(0);
  
  const intervals = [];
  
  if(rejectStatus) {
    intervals.push(setInterval(()=>{
      setRejectStatusProgress(prev => {
        if(prev >= 100){
          setTimeout(()=> setRejectStatus(false) ,1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100));
  }
  
  if(roomIdCheak) {
    intervals.push(setInterval(()=>{
      setRoomIdCheakProgress(prev => {
        if(prev >= 100){
          setTimeout(()=> setRoomIdCheak(false) ,1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100));
  }
  
  if(cheackName) {
    intervals.push(setInterval(()=>{
      setCheackNameProgress(prev => {
        if(prev >= 100){
          setTimeout(()=> setCheakName(false) ,1000);
          return 100;
        }
        return prev + 2;
      });
    }, 100));
  }
  
  return () => intervals.forEach(interval => clearInterval(interval));
}, [rejectStatus, roomIdCheak, cheackName]);

useEffect(() => {
  if(roomIdCheakProgressRef.current){
    roomIdCheakProgressRef.current.style.width = `${roomIdCheakProgress}%`;
  }
}, [roomIdCheakProgress]);

useEffect(() => {
  if(rejectStatusProgressRef.current){
    rejectStatusProgressRef.current.style.width = `${rejectStatusProgress}%`;
  }
}, [rejectStatusProgress]);

useEffect(() => {
  if(cheackNameProgressRef.current){
    cheackNameProgressRef.current.style.width = `${cheackNameProgress}%`;
  }
}, [cheackNameProgress]);

 useEffect(()=> {
  if(status){
    setTimeout(()=>{
      setStatus(false);
      setAdminNotResponce(true);
    }, 1.5 * 60 * 1000);
  }
 },[status])


  useEffect(() => {
    const user = auth.currentUser
    socket.on("room-joined" , async({ status }) => {
       if((status === "accepted" || status === "admin") && roomId){
        navigate(`/editor/${roomId}?name=${encodeURIComponent(name)}`)
       }else if(status === 'NOT'){
           setStatus(false);
          //  alert("Room Is not Exist. Please Enter Correct Room Id")
          setRoomIdCheak(true);
      }else if(status === 'Already-exist'){
        setStatus(false);
        setCheakName(true);
      }else{
         setStatus(false);
        //  alert("You are not allowed to join this room. You are Rejected By the Admin.");
         setRejectStatus(true);
       }
      })
      // fetchUserRooms()

    socket.on("room-join-failed" , ({reason}) => {
      // alert("Room Join Failed :" ,+reason)
      setRoomIdCheak(true);
      setStatus(false);
    })

    socket.on("error", (error)=>{
      setErrorMessage(prev => prev.some(e => e.message === `${error}`)
        ? prev
        : [...prev , {id: Date.now() , message:`${error}`}]
      );
    })

     if (!user) return;
    setAuthName(user.displayName);
    // if (!name) setName(user.displayName); 



    return () => {
      socket.off("room-joined");
      socket.off("room-join-failed");
      socket.off("error");
    }
  },[roomId , name , navigate])

  useEffect(() => {
  if (roomIdCheak && "roomToast") {
    const toastEl = document.getElementById("roomToast");
    if (toastEl) {
      const toast = new window.bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  if(rejectStatus && "roomToast1") {
    const toastEl1 = document.getElementById("roomToast1");
    if (toastEl1) {
      const toast1 = new window.bootstrap.Toast(toastEl1);
      toast1.show();
    }
  }
}, [roomIdCheak , rejectStatus]);

  useEffect(() => {
   const handlePopState = () => {
    if(localStorage.getItem("blocked") === "true"){
      setkicked(true)
      window.history.pushState(null, "" , "/");
    }
   }

    window.addEventListener("popstate" , handlePopState)
    return () => window.removeEventListener("popstate" , handlePopState);
  } , []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user) {
          const displayName = user.displayName || '';
          setAuthName(displayName);
          setName((prevName) => prevName || displayName);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setAuthName('');
        setName('');
      }
    });
    return () => unsubscribe();
  }, []);

  useGSAP(() => {
    document.fonts.ready.then(() => {
      const t1 = gsap.timeline({repeat: -1, repeatRefresh: true});
      const split = new SplitText(".Text", {type: 'chars, words'});
      const chars = split.chars;

      t1.from(chars, {
        opacity: 0,
        stagger: 0.05,
        duration: 1,
        ease: "power4.inOut"
      });

      t1.to(chars, {
        opacity: 0,
        duration: 30,
        stagger: 0.6 
      });
    });
  });

  const HandleErrorsFromNav = (err) => {
      setErrorMessage(prev => prev.some(e => e.message === `${err}`)
        ? prev
        : [...prev , {id: Date.now() , message:`${err}`}]
      );
  }

   const handleCloseErrorMessage = (id) => {
      setErrorMessage(prev => prev.filter(e => e.id !== id));
    };

    document.body.style.backgroundColor = "#030A1C";
   
    return(
        <div>
          {roomIdCheak && (
              <div className="">
                <div className="toast show bottom-0 end-0 position-absolute" id="roomToast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" style={{ zIndex: 9999 }}>
                    <div className="toast-header bg-danger text-white ">
                      <strong className="me-auto">Invalid Status</strong>
                      <button type="button" className="btn-close" data-bs-dismiss="toast" onClick={()=>setRoomIdCheak(false)} aria-label="Close"></button>
                    </div>
                    <div className="toast-body bg-dark text-light">
                      <p>Room ID is not valid. Please enter a valid Room ID.</p>
                      <div className="progress mt-2">
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" 
                            role="progressbar" 
                            style={{ width: `${roomIdCheakProgress}%`, height: '0.5vw' }}
                            ref={roomIdCheakProgressRef}></div>
                      </div>
                    </div>
                </div>
              </div>
          )}
          {rejectStatus && (
              <div className="">
                <div className="toast show bottom-0 end-0 position-absolute" id="roomToast1" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" style={{ zIndex: 9999 }}>
                    <div className="toast-header bg-danger text-white ">
                      <strong className="me-auto">Invalid Status</strong>
                      <button type="button" className="btn-close" data-bs-dismiss="toast" onClick={()=>setRejectStatus(false)} aria-label="Close"></button>
                    </div>
                    <div className="toast-body bg-dark text-light">
                      <p>You are not allowed to join this room. The admin rejected your request.</p>
                      <div className="progress mt-2">
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" 
                            role="progressbar" 
                            style={{ width: `${rejectStatusProgress}%`, height: '0.7vw' }}
                            ref={rejectStatusProgressRef}>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
          )}

          {cheackName && (
              <div className="">
                <div className="toast show bottom-0 end-0 position-absolute" id="roomToast1" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" style={{ zIndex: 9999 }}>
                    <div className="toast-header bg-danger text-white ">
                      <strong className="me-auto">Invalid Status</strong>
                      <button type="button" className="btn-close" data-bs-dismiss="toast" onClick={()=>setCheakName(false)} aria-label="Close"></button>
                    </div>
                    <div className="toast-body bg-dark text-light">
                       <p>The name '{name}' is already in use in this room. Please choose a different name.</p>
                      <div className="progress mt-2">
                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-danger" 
                            role="progressbar" 
                            style={{ width: `${cheackNameProgress}%`, height: '0.7vw' }}
                            ref={cheackNameProgressRef}
                        >
                        </div>
                      </div>
                    </div>
                </div>
              </div>
          )}

          {AdminNotResponce && (
              <div className="">
                <div className="toast show bottom-0 end-0 position-absolute" id="roomToast1" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false" style={{ zIndex: 9999 }}>
                    <div className="toast-header bg-danger text-white ">
                      <strong className="me-auto">Invalid Status</strong>
                      <button type="button" className="btn-close" data-bs-dismiss="toast" onClick={()=>setAdminNotResponce(false)} aria-label="Close"></button>
                    </div>
                    <div className="toast-body bg-dark text-light">
                       <p>The room admin hasn't responded yet. Please try again later or contact them directly.</p>
                    </div>
                </div>
              </div>
          )}

          {Kicked && 
            <div className={`modal fade ${Kicked ? 'show' : ''} custom-modal`} id="dangerModal" style={{display:'block' , zIndex:9999}} tabindex="-1">
              <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                      <div className="modal-header text-center d-block">
                          <div className="modal-icon warning-icon">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                          </div>
                          <h3 className="modal-title w-100">Important Notice</h3>
                      </div>
                      <div className="modal-body text-center py-4">
                          <p>You were removed from the room and cannot rejoin.</p>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-cancel modal-btn me-3" onClick={() => setkicked(false)} data-bs-dismiss="modal">Ok</button>
                      </div>
                  </div>
              </div>
          </div>
          }
            {errorMessage && <ShowError errorMessage={errorMessage} CloseErrorMessageModal={handleCloseErrorMessage}/>}
            <NavBar name={name} SignInG={SignInG} setSignInG={setSignInG} authError={authError} setAuthError={setAuthError} authSuccess={authSuccess} setAuthSuccess={setAuthSuccess}  userRoom={userRoom} setUsersRooms={setUsersRooms} ErrorsFromNav={HandleErrorsFromNav}/>
            <TechBubbles/>
            <div className='Home-container'>
            <div className="Home">
              <h1 className="Text text-light position-absolute top-0 start-50 translate-middle-x mt-5 fw-large">Welcome to the CodeSync</h1>
 
                <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="border border-1 rounded shadow-lg p-4">
                        <div className="p-4 ">
                          <div className=" row text-light p-2">
                            <label htmlFor="" className="col-sm-12 col-form-label">Enter Room ID</label>
                          </div>
                          <div className="mx-2 row">
                            <input
                              className="form-control-plaintext text-light border rounded border-info-subtle"
                              value={roomId}
                              onChange={(e) => setRoomId(e.target.value)}
                              placeholder="Enter Room ID. If you have"
                              type="text"
                            />
                          </div>
                          <div className=" row text-light p-2">
                            <label htmlFor="" className="col-sm-12 col-form-label">Enter Developer Name</label>
                          </div>
                          <div className="mx-2 row">
                              <input
                                className="form-control-plaintext text-light border rounded border-info-subtle"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter Developer Name"
                                type="text"
                                required
                              />
                          </div>
                        </div>
                          <div className="d-flex justify-content-between create-join-btn gap-3">
                            {!roomIdCheak && !status && !cheackName ? (
                              <button onClick={handleJoin} className="editor-btn join-btn">
                                <span className="btn-icon">→</span>
                                <span className="btn-text">Join Room</span>
                              </button>
                            ) : (
                              <button className="editor-btn join-btn loading">
                                <div className="spinner"></div>
                                <span>Request Sending...</span>
                              </button>
                            )}
                            <button onClick={handleCreateRoom} className="editor-btn create-btn">
                              <span className="btn-icon">+</span>
                              <span className="btn-text">Create Room</span>
                            </button>
                          </div>
                    </div>
                </div>
            </div>
        </div>
       </div>
    ) 
}

export default HomePage;
