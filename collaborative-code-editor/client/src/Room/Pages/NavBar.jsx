import React, { useEffect, useState } from 'react';
import { auth, db } from '../../Auth/FireBaseAuth';
import { doc, getDoc ,updateDoc , deleteField  } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading/Loading';
import Logo from '../../Logo/CodeSync.png';
import socket from "../../SocketClient/socket";
import '../Styles/HomePage.css';
import '../Styles/EditorPage.css';
import GoogleSign from '../../Auth/GoogleAuth';
import GitHubSing from '../../Auth/GitHubAuth';
import EmailAuth from '../../Auth/EmailAuth';
import RoomDeleteModel from '../Modals/RoomDeleteModel'

export default function NavBar(props) {
    // const [userRoom, setUsersRooms] = useState([]);
    const [userObj, setUserObj] = useState(null);
    const [Uname, setUname] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [error , setError] = useState('');
    const navigate = useNavigate();
    const [loading , setLoading] = useState(false);
    const [OpenRoomDeleteModel , setOpenRoomDeleteModel ] = useState({status:false , roomId:null});

    const fetchUserRooms = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const docRef = doc(db, "userRooms", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                props.setUsersRooms(data);
            }
        } catch (err) {
            console.error("Error fetching rooms:", err.message);
            setError("Problem on Fetching RoomId , Please Cheack Your Connection and refresh the page")
        }
    };

    const DeleteRoomFromFireBase = async (roomID) => {
        const user = auth.currentUser;
        if(!user && !roomID && !user.uid) return;
        console.log("user is Exist", user.uid);
        const userDocRef = doc(db , 'userRooms' , user.uid);
        setLoading(true);
        try{
           const docSnap = await getDoc(userDocRef);

           if(docSnap.exists() && docSnap.data().rooms?.[roomID]){
              await updateDoc(userDocRef , {
                [`rooms.${roomID}`] : deleteField()
              });
            fetchUserRooms();
           } else {
            props.ErrorsFromNav(`Room ${roomID} does not exist for user ${user.uid}`);
            console.log(`Room ${roomID} does not exist for user ${user.uid}`)
           }
        }catch(err){
           props.ErrorsFromNav(err.message);
           console.log(err.message)
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        try{
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    await user.reload();
                    if (user.emailVerified) {
                        setUserObj(user);
                    } else {
                        setUserObj(null);
                        props.setAuthError("❌ Please verify your email to access the Your Room Id's.");
                        await signOut(auth);
                    }
                } else {
                    setUserObj(null);
                }
            });
            
            return () => unsubscribe();
        }catch(err){
          console.log("Error On Auth Chang" , err.message);
          props.ErrorsFromNav("Somthing went Wrong ", err.message);
        } 
    }, []);

    const SignOut = async () => {
        try {
            await signOut(auth);
            setShowProfileModal(false);
        } catch (err) {
            console.log("Sign Out Failed ", err);
        }
    }

    const JoinRoom = (roomId) => {
        socket.emit("join-room", { roomId, Uname, isCreator: true });
        navigate(`/editor/${roomId}?name=${encodeURIComponent(Uname)}&creator=1`);
        setShowProfileModal(false);
    }

    useEffect(() => {
        fetchUserRooms();
        setUname(props.name)
    }, [Uname, userObj, props.name]);

    const DeleteRoomPermission =(roomId) => {
         DeleteRoomFromFireBase(roomId);
         socket.emit("delete-room" , roomId);
         setOpenRoomDeleteModel({status:false , roomId:null});
    }

    return (
        <div>
            {props.SignInG && (
                <div className="modal fade show " style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }} >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content bg-dark text-light">
                            <div className="modal-header">
                                <h5 className="modal-title">Sign In</h5>
                                <button type="button" className="btn-close" onClick={() => props.setSignInG(false)} data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body p-0 my-5">
                                <div className='GoogleBtn'>
                                    <GoogleSign onError={props.setAuthError} onSuccess={props.setAuthSuccess} />
                                    <GitHubSing onError={props.setAuthError} onSuccess={props.setAuthSuccess} />
                                    <EmailAuth onError={props.setAuthError} onSuccess={props.setAuthSuccess} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {OpenRoomDeleteModel.status && <RoomDeleteModel CloseRoomDeleteModel={()=>setOpenRoomDeleteModel({status:false , roomId:null})} RoomIdToDelete={OpenRoomDeleteModel.roomId} OpenRoomDeleteModel={OpenRoomDeleteModel} HandleDeleteRoom={DeleteRoomPermission}/>}
            {/* Profile Modal */}
            {showProfileModal && (
                <div className="modal fade show Modal-fix-P" id="ProfileModel" tabIndex="-1" aria-labelledby="ProfileModelLabel" aria-hidden="true"  style={{ display: "block" }}>
                    <div className="modal-dialog Modal-fix">
                        <div className="modal-content bg-dark text-light Modal-Content-profile">
                            <div className="modal-header border-bottom border-secondary">
                                <div className="d-flex align-items-center w-100">
                                    {userObj && userObj.photoURL ? (
                                        <img src={userObj.photoURL} onError={(e) => {e.target.onerror=null ; e.target.src='https://th.bing.com/th/id/OIP.Gfp0lwE6h7139625a-r3aAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'}} className="rounded-circle me-3" width="50" alt="user" />
                                    ) : (
                                        <img src='https://th.bing.com/th/id/OIP.Gfp0lwE6h7139625a-r3aAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3' className='rounded-circle me-3' width='50' alt='user' />
                                    )}
                                    <div>
                                        <h5 className="modal-title mb-0">{userObj?.displayName || "Guest, Profile"}</h5>
                                        <small className="text-light">{userObj?.email}</small>
                                    </div>
                                </div>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProfileModal(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-4">
                                    <h6 className="text-info mb-3">Your Older Room Id's</h6>
                                    <div className="room-list" style={{ height: "20vh", overflowY: "auto" }}>
                                        {props.userRoom?.rooms && Object.entries(props.userRoom.rooms).length > 0 ? (
                                            Object.entries(props.userRoom.rooms).map(([roomId, info], index) => (
                                                <div key={index} className="card bg-dark mb-2 border-secondary">
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className="mb-1 text-primary fw-bold">{roomId}</p>
                                                                <small className="text-dark-emphasis">
                                                                    Joined: {new Date(info.joinedAt).toLocaleString()}
                                                                </small>
                                                            </div>
                                                            <div className='d-flex Button-join-del'>
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary"
                                                                    onClick={() => JoinRoom(roomId)}
                                                                    title='Join room'
                                                                >
                                                                    Join
                                                                </button>
                                                                <button
                                                                    className={`Delete-room`}
                                                                    onClick={ () => setOpenRoomDeleteModel({status:true , roomId:roomId})}
                                                                    title='Delete Room'
                                                                >
                                                                <i className={`${loading ? '' :'bi bi-trash3-fill'}`}></i>
                                                                <div className={`${loading ? 'spinner' : 'd-none'}`}></div>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                               { props.userRoom ?
                                                 (<div className='d-flex flex-column align-items-center'>
                                                    <Loading/>
                                                    <p className="mt-2">No rooms found.</p>
                                                 </div>) : (
                                                    {error}
                                                 )
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-secondary">
                                <button 
                                    className="btn btn-danger"
                                    onClick={SignOut}
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i>Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="nav">
                <div className="LOGO">
                    <img src={Logo} alt="Logo" />
                </div>
                <div className="ms-auto d-flex align-items-center gap-2 mx-2">
                    {userObj !== null && userObj ? (
                        <>
                            {userObj.photoURL ? (
                                <div>
                                    <img 
                                        src={userObj.photoURL}
                                        onError={(e)=>{
                                          e.target.onerror=null;
                                          e.target.src='https://th.bing.com/th/id/OIP.Gfp0lwE6h7139625a-r3aAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
                                        }}
                                        className="rounded-circle text-light profile-pictuar" 
                                        width="40" 
                                        alt="user" 
                                        onClick={() => setShowProfileModal(true)}
                                        style={{ cursor: "pointer" }}
                                        data-bs-target="#ProfileModel"
                                    />
                                </div>
                            ) : (
                                <img 
                                    src="https://th.bing.com/th/id/OIP.Gfp0lwE6h7139625a-r3aAHaHa?w=177&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" 
                                    className="rounded-circle" 
                                    alt="user" 
                                    width="30" 
                                    style={{ objectFit: "cover", cursor: "pointer" }}
                                    onClick={() => setShowProfileModal(true)}
                                />
                            )}
                        </>
                    ) : (
                        <button className='btn btnOutlineLight' onClick={() => props.setSignInG(true)}>Sign In</button>
                    )}
                </div>
            </nav>
        </div>
    );
}