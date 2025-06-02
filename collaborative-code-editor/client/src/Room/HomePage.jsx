import React , { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import './HomePage.css'; 
import gsap from "gsap";
import { useGSAP } from '@gsap/react'
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(Physics2DPlugin, useGSAP);
gsap.registerPlugin(SplitText);

const HomePage = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [name , setName ] = useState("");


   useGSAP(() => {
  const masterTl = gsap.timeline({
    paused: true,
  });
  
  const cannon = document.querySelector(".cannon");
  const angle = 20;
  
  // Cannon recoil animation
  const tl1 = gsap
    .timeline()
    .to(cannon, {
      rotation: -angle,
      duration: 0.6,
      ease: "power1.out"
    })
    .to(
      cannon,
      {
        rotation: angle,
        ease: "power1.inOut",
        duration: 0.6,
        repeat: 2,
        yoyo: true
      }
    )
    .to(cannon, {
      rotation: 0,
      duration: 2,
      ease: "power1.in"
    });


  const bullets = [];
  const bulletsContainer = document.querySelector(".flair-container");
  const tl1Time = tl1.duration();

  // Create bullets and position them at the cannon's tip
  for (let i = 0; i < 40; i++) {
    const className = "flair--" + gsap.utils.random(2, 35, 1);
    let flairBullet = document.createElement("div");
    flairBullet.setAttribute("class", "flair flair-bullet " + className);
    bulletsContainer.appendChild(flairBullet);
    
    // Position at cannon's tip
    gsap.set(flairBullet, { 
      x: gsap.utils.random(-15, 15), // slight random spread
      y: -60, // position above the cannon
      scale: gsap.utils.random(0.4, 0.7),
      rotation: gsap.utils.random(-30, 30) // random rotation
    });
    
    bullets.push(flairBullet);
  }

  const tl2 = gsap
    .timeline()
    .to(bullets, {
      opacity: 1,
      duration: 2,
      stagger: {
        amount: 0.5
      }
    })
    .to(
      bullets,
      {
        duration: 2,
        y: () => gsap.utils.random(-1000, -800), // initial upward burst
        x: () => gsap.utils.random(-500, 500), // horizontal spread
        rotation: () => gsap.utils.random(-360, 360),
        ease: "power1.out",
        stagger: {
          amount: 1
        }
      },
      0
    )
    .to(
      bullets,
      {
        duration: 2,
        y: 300, // fall down
        ease: "power1.in",
        stagger: {
          amount: 0.5
        }
      },
      0.8
    )
    .to(bullets, {
      opacity: 0,
      duration: 0.3,
      delay: 1.5,
      onComplete: function() {
        // Remove bullets after animation
        bullets.forEach(bullet => {
          if (bullet.parentNode) {
            bullet.parentNode.removeChild(bullet);
          }
        });
      }
    });
    
  masterTl
    .add(tl1, 0)
    .add(tl2, 0)
    .play();
  
  // window.addEventListener("click", () => {
  //   // Clear any existing bullets before restarting
  //   while (bulletsContainer.firstChild) {
  //     bulletsContainer.removeChild(bulletsContainer.firstChild);
  //   }
  //   masterTl.restart();
  // });
}, []);


useGSAP(() => {
  const t1 = gsap.timeline({repeat: -1 , repeatRefresh: true});

  const split = new SplitText(".Text" , {type : 'chars, words'})
  const chars = split.chars;

  t1.from(chars , {
    opacity:0,
    stagger: 0.05,
    duration: 1,
    ease : "power4.inOut"
  })

  t1.to(chars, {
    opacity: 0,
    duration: 30,
    stragger: .6,
  })

})

    
    const handleJoin = () =>{
        if(!roomId) {
            alert("Room ID is required");
            return;
        }
        navigate(`/editor/${roomId}?name=${encodeURIComponent(name)}`);
    }

    const handleCreateRoom = () => {
        const id =uuidv4();
        console.log("Generated Room ID:", id);
        navigate(`/editor/${id}?name=${encodeURIComponent(name)}`);
    }
    document.body.style.backgroundColor = "#030A1C";
   
    return(
        <div>
            <div style={{padding: "30px"}} className="">
                <h1 className="Text text-light position-absolute top-0 start-50 translate-middle-x mt-5">Welcome to the Collaburative Code Editor</h1>
                <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="border border-1 rounded shadow-lg p-4" style={{width: "55vmin" , height: "45vmin"}}>
                        <div className="p-4 ">
                          <div className=" row text-light p-2">
                            <label htmlFor="" className="col-sm-12 col-form-label">Enter Room ID</label>
                          </div>
                            <div className="mx-2 row">
                                <input
                                className="form-control-plaintext text-light border rounded border-info-subtle"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                placeholder="Enter Room ID"
                                type="text"
                                required
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
                            <div className="d-flex justify-content-between">
                                <button onClick={handleJoin} className="btn btn-danger">Join Room</button>
                                <button onClick={handleCreateRoom} className="btn btn-primary">Create Room</button>
                            </div>
                    </div>
                </div>
            </div>
            <div className="">
                <div className="position-absolute bottom-0 start-50 translate-middle-x">
                    <div className="cannon flair" ></div>
                    <div className="flair-container"></div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;