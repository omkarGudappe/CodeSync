import { io } from "socket.io-client";
const socket = io("https://codesync-rqbm.onrender.com",
     { 
        withCredentials: true,
        transports: ['websocket', 'polling'],
        secure: true,
        rejectUnauthorized: false
    });
export default socket;

// import { io } from "socket.io-client";
// // const socket = io("http://localhost:4000", {
// //   withCredentials: true,
// //   transports: ['websocket', 'polling'],
// //   reconnection: true,
// //   reconnectionAttempts: 5,
// //   reconnectionDelay: 1000,
// //   autoConnect: true
// // });


// const socket = io("http://localhost:4000", {
//     withCredentials: true,
//     transports: ['websocket'],
//     reconnection: true
// });

// export default socket;
