import { useEffect, useRef, useState , useMemo  } from "react";
import Editor from "@monaco-editor/react";
import socket from "../../SocketClient/socket";
import { useParams , useSearchParams , useNavigate  } from "react-router-dom";
import Loading from "../Loading/Loading";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'monaco-editor/min/vs/editor/editor.main.css';
import TerminalE from "./TerminalE";
import '../Styles/EditorPage.css'
import Toast from '../Modals/Toast'
import Logo from '../../Logo/CodeSync.png';
import Select from "react-select";
import { doc , setDoc, getDoc} from "firebase/firestore";
import { auth, db } from "../../Auth/FireBaseAuth";
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider  } from 'y-websocket';
import  LoadingSpinner from '../Loading/LoadingSpinner';
// import JSZip from "jszip";
import { useSignIn } from './SignInContext'
import GoogleSign from '../../Auth/GoogleAuth';
import GitHubSing from '../../Auth/GitHubAuth';
import EmailAuth from '../../Auth/EmailAuth';
import InviteRoom from '../Modals/InviteRoom';
import ToastNotifySound from '../../Sound/TostSound.mp3'
import RejoinTune from '../../Sound/RejoinTune.mp3'
import FilesDownloadModal from '../Modals/FilesDownloadModal'
import LeaveRoomModal from '../Modals/LeaveRoomModal'
import KickedUserModal from '../Modals/KickedUserModal'
import MobileMenu from './MobileMenu'
import { isNull, throttle } from 'lodash';
import ShowError from "../Modals/ShowError";
import ChatPanel from '../Panels/ChatPanel';
import OpenFileDeleteModal from "../Modals/OpenFileDeleteModal";
import { loadVsCodeTheme } from '../../VSTheme/vsCodeTheme'
import RustIcon from '../../Logo/RustICON.png'
import FeedBackModel from '../Modals/FeedBackModel';
import UserConfirmationKickeModel from "../Modals/UserConfirmationKickeModel";



const languageOptions = [
  {
    value: "javascript",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg"
             alt="js" style={{width: 20, height: 20, marginRight: 8}} />
        JavaScript
      </div>
    )
  },
  {
    value: "python",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg"
             alt="python" style={{width: 20, height: 20, marginRight: 8}} />
        Python
      </div>
    )
  },
  {
    value: "cpp",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg"
             alt="cpp" style={{width: 20, height: 20, marginRight: 8}} />
        C++
      </div>
    )
  },
  {
    value: "java",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg"
             alt="java" style={{width: 20, height: 20, marginRight: 8}} />
        Java
      </div>
    )
  },
  {
    value: "go",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg"
             alt="go" style={{width: 20, height: 20, marginRight: 8}} />
        Go
      </div>
    )
  },
  {
    value: "ruby",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/ruby/ruby-original.svg"
             alt="ruby" style={{width: 20, height: 20, marginRight: 8}} />
        Ruby
      </div>
    )
  },
  {
    value: "rust",
    label: (
      <div style={{display: "flex", alignItems: "center" }}>
       <div style={{overflow:'hidden'}}>
        <img src={RustIcon}
             alt="rust" style={{width: 30, height: 30, marginRight: 8}} />
       </div>
        Rust
      </div>
    )
  },
  {
    value: "php",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/php/php-original.svg"
             alt="php" style={{width: 20, height: 20, marginRight: 8}} />
        PHP
      </div>
    )
  },
  {
    value: "typescript",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg"
             alt="typescript" style={{width: 20, height: 20, marginRight: 8}} />
        TypeScript
      </div>
    )
  },
  {
    value: "html",
    label: (
      <div style={{display: "flex", alignItems: "center"}}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg"
             alt="html" style={{width: 20, height: 20, marginRight: 8}} />
        HTML
      </div>
    )
  },
  {
    value: "c",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg"
            alt="c" style={{ width: 20, height: 20, marginRight: 8 }} />
        C
      </div>
    )
  },
  {
    value: "csharp",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/csharp/csharp-original.svg"
            alt="csharp" style={{ width: 20, height: 20, marginRight: 8 }} />
        C#
      </div>
    )
  },
  {
    value: "dart",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg"
            alt="dart" style={{ width: 20, height: 20, marginRight: 8 }} />
        Dart
      </div>
    )
  },
  {
    value: "swift",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/swift/swift-original.svg"
            alt="swift" style={{ width: 20, height: 20, marginRight: 8 }} />
        Swift
      </div>
    )
  },
  {
    value: "sql",
    label: (
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg"
            alt="sql" style={{ width: 20, height: 20, marginRight: 8 }} />
        SQL
      </div>
    )
  },

];

function EditorPage() {
  const { roomId } = useParams();
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileCodes, setFileCodes] = useState({});
  const [newFileName, setNewFileName] = useState("");
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const userName = searchParams.get('name') || 'Anonymous';
  const isCreator = searchParams.get("creator") === "1";
  const [activeUsers, setActiveUsers] = useState([]);
  const [runInTerminal, setRunInTerminal] = useState(0);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [chatMessage , setChatMessage] = useState([]);
  const [chatInput , setChatInput] = useState("");
  const [toastInfo, setToastInfo] = useState(null);
  const [pendingJoins, setPendingJoins] = useState([]);
  const [ishtml , setIshtml] = useState(false)
  const [gethtml ,setGethtml] = useState("")
  const [admin , setAdmin] = useState("")
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isChatOpenRef = useRef(isChatOpen);
  const [showMobileTerminal, setShowMobileTerminal] = useState(false);
  const [viewMode, setViewMode] = useState("editor");
  const skipNextChange = useRef(false);
  const monacoRef = useRef(null);
  const [terminalHide , setTerminalHide] = useState(false);
  const navigate = useNavigate();
  const yProviders = useRef({});
  const user = auth.currentUser;
  const bindingRef = useRef(null);
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [isSaveRoom , setIsSaveRoom] = useState(false);
  const [errorMessage, setErrorMessage] = useState([]);
  const [liveEditorCode, setLiveEditorCode] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  // const [selectedDownloads, setSelectedDownloads] = useState([]);
  const { setSignInG  , SignInG , setAuthError , setAuthSuccess , userRoom } = useSignIn();
  const [showSignIn, setShowSignIn] = useState(true);
  const [SaveRoomBtnClose , setSaveRoomBtnClose] = useState(true);
  const [isStaleUser, setIsStaleUser] = useState(false);
  const [OpenShareRoomModal , setOpenShareRoomModal] = useState(false);
  const [LeaveRoom , setLeaveRoom] = useState(false);
  const [Kicked , setKicked] = useState(false);
  const [CountDown , setCountDown] = useState();
  const [RoomIdExist , setRoomIdExist] = useState(false);
  const isRunningCodeRef = useRef(isRunningCode);
  const interactedRef = useRef(false);
  const createFileInputRef = useRef();
  const [toasts, setToasts] = useState([]);
  const [OpenDeleteFileModal , setOpenDeleteFileModal] = useState({status:false , FileName:null});
  const [isYjsSynced, setIsYjsSynced] = useState(false);
  const chatPanelRef = useRef()
  const [IsFeedBackModelOpen , setIsFeedBackModelOpen] = useState(false);
  const [IsClosedBtnClickd , setIsClosedBtnClickd] = useState(false);
  const [IsClosedBtnClickedSignIn , setIsClosedBtnClickedSignIn] = useState(false);
  const CreateFileBtnRef = useRef()
  const [UserKickedConfiremation , setUserKickedConfiremation] = useState(false);

  useEffect(() => {
    if (!activeFile || !editorRef.current) return;

    const interval = setInterval(() => {
      const currentCode = editorRef.current.getValue();
      socket.emit("code-change", {
        roomId,
        fileName: activeFile,
        code: currentCode,
      });
    }, 3000); // save every 3s

    return () => clearInterval(interval);
  }, [activeFile]);


useEffect(() => {
  isChatOpenRef.current = isChatOpen;
  
    if (!userRoom || !userRoom.rooms) return;
    const roomExists = Object.keys(userRoom.rooms).includes(roomId);

    if (roomExists) {
      localStorage.setItem('Already' , `${roomId}`);
    } else {
      setRoomIdExist(false);
    }
  }, [isChatOpen, userRoom, roomId]);

  useEffect(()=>{
    if(localStorage.getItem('Already') === roomId){
      setRoomIdExist(true);
    }
  } , [])

  useEffect(() => {
    const enableAudio = () => {
      if (!interactedRef.current) {
        interactedRef.current = true;
      }
    };

    window.addEventListener('click', enableAudio);
    window.addEventListener('keydown', enableAudio);

    return () => {
      window.removeEventListener('click', enableAudio);
      window.removeEventListener('keydown', enableAudio);
    };
  }, []);

    useEffect(() => {
      if (!roomId || !userName) return;

     const IsCreator = async() =>{
      if(isCreator){
        socket.emit("join-room", { roomId , name: userName , isCreator });
        setAdmin(userName);
      } else{
        socket.emit("final-join", { roomId, name: userName });
      }
    }

    IsCreator();

      socket.on("NewJoin" , ({name}) => {
          addToast({ type: 'user-joined', name });
      })

      socket.on("admin-info", (adminInfo) => {
        let adminName = "";
        if (adminInfo && typeof adminInfo === "object") {
          if (adminInfo[roomId] && adminInfo[roomId].name) {
            adminName = adminInfo[roomId].name;
          } else if (adminInfo.name) {
            adminName = adminInfo.name;
          }
        }
        setAdmin(adminName);
      });

      socket.on("active-users", (users) => {
        setActiveUsers(users);
      });

      socket.on("join-request" , ({requesterId , name}) => {
          setPendingJoins(prev => [...prev , {requesterId , name}])
  
            if (interactedRef.current) {
              const audio = new Audio(ToastNotifySound);
              audio.volume = 0.2;
              audio.play().catch((e) => console.warn("Sound failed:", e));
            }
      })

    const handleFilesData = (filesData) => {
        setFiles(filesData);

        setFileCodes(prev => {
          const next = { ...prev };
          for (const file of filesData) {
            if (typeof prev[file.name] === 'undefined' && (!yDocs.current[file.name] )) {
              next[file.name] = file.code ?? "";
            }
          }
          return next;
        });

        if (!activeFile || !filesData.some((f) => f.name === activeFile)) {
          setActiveFile(filesData[0]?.name || null);
        }
      };

    const handleChatMessage = ({ message, name, timestamp }) => {
      setChatMessage(prev => [...prev, { message, name, timestamp }]);
      if (!isChatOpenRef.current && name !== userName) {
        setChatUnreadCount(prev => prev + 1);
      }
    };

    socket.on("chat-message", handleChatMessage);
    
    socket.on("file-created-toast" , ({name , fileName}) => {
      addToast({ type: 'file-created', name, fileName });
    })

    socket.on("files-data", handleFilesData);

    return () => {
      socket.off("files-data" , handleFilesData);
      socket.off("active-users");
      socket.off("chat-message");
      socket.off("join-request");
      socket.off("file-created-toast");
      socket.off("NewJoin");
    };
  }, [roomId , userName , isCreator]);

  const isDuplicateToast = (toasts, newToast) => {
    if (newToast.type === 'file-created') {
      return toasts.some(t =>
        t.type === 'file-created' && 
        t.name === newToast.name && 
        t.fileName === newToast.fileName
      );
    }else if(newToast.type === 'file-delete'){
      return toasts.some(t =>
        t.type === 'file-delete' &&
        t.name === newToast.name &&
        t.fileName === newToast.fileName
      )
    }
    return toasts.some(t => 
      t.type === newToast.type && 
      t.name === newToast.name &&
      Date.now() - parseInt(t.id) < 5000
    );
  };


   const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => {
      // Skip if this is a duplicate toast
      if (isDuplicateToast(prev, toast)) {
        return prev;
      }
      
      const id = Date.now().toString();
      return [...prev, { ...toast, id }];
    });
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

    const removeToast = (id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    };
  

  useEffect(() => {
    if (showMobileTerminal) {
      setTimeout(() => setFitTrigger(f => f + 1), 150);
    }
  }, [showMobileTerminal]);


  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.trim().replace(/\s*\.\s*/g, '.');;
    const lang = getLanguageFromFileName(fileName);
    socket.emit("create-file", {
      roomId,
      fileName,
      language: lang,
    });

    setNewFileName("");
  };

  useEffect(() => {
    socket.on("file-created-confirmed", ({ fileName }) => {
      setActiveFile(fileName);
    });

    return () => socket.off("file-created-confirmed");
  }, []);


  const getLanguageFromFileName = (filename) => {
    if (filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".ts")) return "typescript";
    if (filename.endsWith(".py")) return "python";
    if (filename.endsWith(".java")) return "java";
    if (filename.endsWith(".cpp")) return "cpp";
    if (filename.endsWith(".c")) return "c";
    if (filename.endsWith(".html")) return "html";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".go")) return "go";
    if (filename.endsWith(".php")) return "php";
    if (filename.endsWith(".rb")) return "ruby";
    if (filename.endsWith(".rs")) return "rust";
    if (filename.endsWith(".c")) return "c";
    if (filename.endsWith(".cs")) return "csharp";
    if (filename.endsWith(".dart")) return "dart";
    if (filename.endsWith(".swift")) return "swift";
    if (filename.endsWith(".sql")) return "sql";
    return "plaintext"; 
  };


  useEffect(()=>{
    if(!activeFile) return;

    const detectFile = getLanguageFromFileName(activeFile);
    setLanguage(detectFile)

  },[activeFile])

   
  const handleDeleteFile = (fileName) => {
    setOpenDeleteFileModal({status:true , FileName:fileName});
  };

  const handleSetNewActiveFile = (fileName) => {
    socket.emit("delete-file", { roomId, fileName });

    setFiles(prev => prev.filter(f => f.name !== fileName));
    if (activeFile === fileName) {
      const otherFile = files.find(f => f.name !== fileName);
      setActiveFile(otherFile?.name || null);
    }
  }

  const terminalRef = useRef(null);

  const handleDragMouseDown = (e) => {
    const startY = e.clientY;
    const startHeight = terminalRef.current.offsetHeight;

    const onMouseMove = (e) => {
      const newHeight = startHeight - (e.clientY - startY);
      setTerminalHeight(Math.max(150, newHeight)); // min height = 150px
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      setFitTrigger(f => f + 1); 
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    if (activeFile && fileCodes[activeFile]) {
      setRunInTerminal(c => c + 1);
    }
  }, [activeFile]);

  useEffect(() => {
    if (activeFile && isEditorMounted) {
      setFitTrigger((c) => c + 1);
    }
  }, [activeFile, isEditorMounted]);

    useEffect(() => {
      if (!activeFile && files.length > 0) {
        setActiveFile(files[0].name);
      }
    }, [activeFile, files]);

  const handleShowModalLeaveRoom = () => {
    setLeaveRoom(true);
  }

  const handleFileChange = async (fileName) => {
    try {
      setIsLoading(true);


      if (editorRef.current && activeFile) {
        const model = editorRef.current.getModel();
        if (model) {
          const currentCode = editorRef.current.getValue();
          setFileCodes(prev => ({
            ...prev,
            [activeFile]: currentCode
          }));
        }
      }

      if (bindingRef.current) {
        try {
          if (typeof bindingRef.current.destroy === 'function') {
            bindingRef.current.destroy();
          }
        } catch (err) {
          console.warn("Error destroying binding:", err);
        } finally {
          bindingRef.current = null;
        }
      }


      setActiveFile(fileName);

      const selectedFile = files.find(f => f.name === fileName);
      if (selectedFile) {
        setLanguage(selectedFile.language || "javascript");
      }
    } catch (err) {
      setErrorMessage(prev => prev.some(e => e.message === `Failed to switch files`)
      ? prev
      : [...prev, { id: Date.now(), message: `Failed to switch files` }]
    );
    } finally {
      setIsLoading(false);
    }
  };


   const yDocs = useRef({});


  const handleEditorDidMount = (editor, monacoInstance) => {
    try {
      editorRef.current = editor;
      monacoRef.current = monacoInstance;
      setIsEditorMounted(true);
      setIsMonacoReady(true)

      editor.layout();

    } catch (err) {
      console.warn("Monaco network error:", err.message);
      setErrorMessage(prev => prev.some(e => e.message === 'Monaco failed to load. Please check your network.')
       ? prev
       : [...prev , {id: Date.now(),message:"Monaco failed to load. Please check your network."}]
      );
      // Optional: fallback UI or display toast
    }

    monacoInstance.editor.defineTheme('myCoolDarkTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'd4d4d4' },               
          { token: 'comment', foreground: '6a9955' },
          { token: 'string', foreground: 'ce9178' },
          { token: 'number', foreground: '96d275' },
          { token: 'keyword', foreground: 'c586c0' },
          { token: 'operator', foreground: 'd4d4d4' },
          { token: 'namespace', foreground: '4ec9b0' },
          { token: 'type.identifier', foreground: '4ec9b0' },
          { token: 'function', foreground: 'dcdcaa' },
          { token: 'class', foreground: '4ec9b0' },          
          { token: 'variable', foreground: '9cdcfe' },
          { token: 'constant', foreground: '9cdcfe' }
        ],
        colors: {
          'editor.background': '#1e1e1e',
          'editor.foreground': '#d4d4d4',
          'editorCursor.foreground': '#ffffff',
          'editor.lineHighlightBackground': '#2a2d2e',
          'editorLineNumber.foreground': '#858585',
          'editor.selectionBackground': '#264f78',
          'editor.inactiveSelectionBackground': '#3a3d41',
          'editorIndentGuide.background': '#404040',
          'editorWhitespace.foreground': '#3b3a32'
        }
      });

  monacoInstance.editor.setTheme("myCoolDarkTheme");


    editor.updateOptions({
      fontSize: 14,
      lineHeight: 21,
      fontFamily: 'Fira Code, monospace',
      minimap: { enabled: false },
      scrollBeyondLastLine: true,
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
    });
  };



  useEffect(() => {
    if (!activeFile || !editorRef.current || !monacoRef.current) return;
    // if (window.innerWidth <= 600 && viewMode !== "editor") return;

    const isMobile = window.innerWidth <= 600;
    const shouldBindEditor = !isMobile || viewMode === 'editor';

    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    const fileName = activeFile;
    const uri = monacoInstance.Uri.parse(`file:///${fileName}`);
    const docName = `${roomId}_${fileName}`;

    try{

      if (bindingRef.current) {
        try {
          bindingRef.current.destroy?.();
        } catch (err) {
          console.warn("Failed to safely destroy binding:", err);
        }
        bindingRef.current = null;
      }

    let model = monacoInstance.editor.getModel(uri);
    if (!model || model.isDisposed()) {
      model = monacoInstance.editor.createModel(
        "",
        getLanguageFromFileName(fileName),
        uri
      );
    }

    if (shouldBindEditor && model && !model.isDisposed && editor && editor.getModel() !== model) {
      editor.setModel(model);
    }

    setIsYjsSynced(false);
    let ydoc = yDocs.current[fileName];
    let provider = yProviders.current[fileName];

    if (!ydoc) {
      ydoc = new Y.Doc();
      yDocs.current[fileName] = ydoc;

      provider = new WebsocketProvider('wss://codesync-yjs-server-con.onrender.com', docName, ydoc, {
        connect: true,
        maxBackoffTime: 5000,
      });
      yProviders.current[fileName] = provider;

      const yText = ydoc.getText('monaco');
      // if (model && yText && model.getValue() === "" && yText.toString().length > 0) {
      //   model.setValue(yText.toString());
      // }

      // provider.once('synced', () => {
      //   if (yText.length === 0 && fileCodes[fileName]) {
      //     yText.insert(0, fileCodes[fileName]);
      //   }
      //   bindingRef.current = new MonacoBinding(yText, model, new Set([editor]), provider.awareness);
      // });

      // provider.once('synced', () => {
      //   setTimeout(() => {
      //     const boiler = fileCodes[fileName] ?? "// Start coding...";
      //     if (yText.length === 0 && boiler.trim() !== "") {
      //       yText.insert(0, boiler);
      //     }

      //     bindingRef.current = new MonacoBinding(
      //       yText,
      //       model,
      //       new Set([editor]),
      //       provider.awareness
      //     );
      //   }, 100);
      // });
      provider.once('synced', () => {
      setTimeout(() => {
        const boiler = fileCodes[fileName] ?? "// Start coding...";
        if (yText.length === 0 && boiler.trim() !== "") {
          yText.insert(0, boiler);
        }

        try {
          if (editor && model && !model.isDisposed()) {
            bindingRef.current = new MonacoBinding(
              yText,
              model,
              new Set([editor]),
              provider.awareness
            );
          } else {
            throw new Error("Editor or model not ready");
          }
        } catch (err) {
          setErrorMessage(prev => prev.some(e => e.message === `Editor failed to load. Try creating or switching files, or try again.`)
          ? prev
          : [...prev , {id: Date.now(), message: `Editor failed to load. Try creating or switching files, or try again.`}]
          );
          if(CreateFileBtnRef.current){
            CreateFileBtnRef.current.click();
          }
        }

        setIsYjsSynced(true);
      }, 1000);
    });
    } else {
      const yText = ydoc.getText('monaco');
      if( shouldBindEditor &&
          yText &&
          model &&
          editor
        )
      {
        setTimeout(()=>{
          try {
            bindingRef.current = new MonacoBinding(
              yText,
              model,
              new Set([editor]),
              provider.awareness
            );
            setIsYjsSynced(true)
          } catch (err) {
            console.warn("Binding failed:", err.message);
            setErrorMessage(prev => prev.some(e => e.message === 'Editor failed to load. Try creating or switching files. or try again')
              ? prev
              : [...prev , {id: Date.now() , message: "Editor failed to load. Try creating or switching files. or try again"}]
            );
          }
        }, 100)
      }
    }
  }catch(err){
    console.error("Error setting up Monaco binding:", err);
    setErrorMessage(prev => prev.some(e => e.message === '⚠️ Failed to load the editor. Please check your network or try again.')
      ? prev
      : [...prev , {id: Date.now() , message: "⚠️ Failed to load the editor. Please check your network or try again."}]
    );
  }

    return () => {
      if (bindingRef.current) {
        try { bindingRef.current.destroy();  } catch (err) {
          console.error("Error destroying Monaco binding:", err);
          setErrorMessage(prev => prev.some(e => e.message === '⚠️ Failed to unload the editor. Please check your network and try again, or refresh the page.')
            ? prev
            : [...prev , {id: Date.now() , message: "⚠️ Failed to unload the editor. Please check your network and try again, or refresh the page."}]
          );
        }
        bindingRef.current = null;
      }
    };
  }, [activeFile, isEditorMounted , viewMode]);


  useEffect(() => {
    setIsYjsSynced(false);
  }, [activeFile]);

  useEffect(()=>{
    setTimeout(() => {
      if (!isYjsSynced) {
        setIsYjsSynced(true);
      }
    }, 3000);
  } , [isYjsSynced])

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose();
        } catch (err) {}
        editorRef.current = null;
      }
      setIsMonacoReady(false);
    };
  }, []);


  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current = null;
      }
      setIsMonacoReady(false);
    };
  }, []);


  useEffect(() => {
    if (viewMode === "editor" && editorRef.current) {
      const editor = editorRef.current;
      const handleResize = () => {
        editor.layout();
      };

      editor.layout();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [viewMode, activeFile, isEditorMounted]);

  useEffect(() => {
    return () => {
      Object.values(yProviders.current).forEach(provider => {
        provider.destroy();
      });
      yProviders.current = {};
      yDocs.current = {};
    };
  }, []);

  useEffect(() => {
     socket.on("kicked-from-room" , () => {
        setKicked(true)
        setCountDown(20);
        setTimeout(()=>{
          navigate('/HomePage' , {replace:true});
          setCountDown(0);
        }, 20000)
        localStorage.setItem("blocked" , "true");
     })

     socket.on("user-leaved" , (name) => {
      addToast({ type: 'user-left', name });
     })

     socket.on("file-deleted" , ({name , fileName})=> {
        addToast({type:'file-delete' , name , fileName})
     })

    socket.on("error", (error)=>{
      setErrorMessage(prev => prev.some(e => e.message === `${error}`)
        ? prev
        : [...prev , {id: Date.now() , message:`${error}`}]
      );
    })

     return () => {
      socket.off("kicked-from-room");
      socket.off("user-leaved");
      socket.off("file-deleted");
      socket.off("error");
     }
  },[]);

  useEffect(()=>{
    if(language === "html"){
      let val = ''
      const ydoc = yDocs.current[activeFile];
      if (ydoc) {
        val = ydoc.getText('monaco').toString();
      } else if (editorRef.current?.getValue) {
        val = editorRef.current.getValue();
      } else {
        val = fileCodes[activeFile] || '';
      }
      setGethtml(val);
      setIshtml(true)
    }else{
      setIshtml(false)
    }
  } , [ishtml , language , gethtml])

  const handleChange = (value) => {
    if (!activeFile || skipNextChange.current) {
      skipNextChange.current = false;
      return;
    }
    
    // throttledEmitChange(value);
  const provider = yProviders.current[activeFile];
    if (provider && provider.shouldConnect === false) {
      provider.connect();
    }
  };


  const handleRunInTerminal = () => {
    try{
      let value = "";

      const ydoc = yDocs.current[activeFile];
      if (ydoc) {
        value = ydoc.getText('monaco').toString();
      } else if (editorRef.current?.getValue) {
        value = editorRef.current.getValue();
      } else {
        value = fileCodes[activeFile] || '';
      }

    if (!value.trim()) {
      setErrorMessage(prev => prev.some(e => e.message === 'No code to execute')
        ? prev
        : [...prev , {id: Date.now() , message:'No code to execute'}]
      );
      return;
    }

      setIsRunningCode(true);
      setLiveEditorCode(value);
      setRunInTerminal(c => c + 1);
    }catch(err){     
      setErrorMessage(prev => prev.some(e => e.message === 'Failed to prepare code for execution')
        ? prev
        : [...prev , {id: Date.now() , message:'Failed to prepare code for execution'}]
      );
      setIsRunningCode(false);
    }
  };
  
  useEffect(()=>{
    isRunningCodeRef.current = isRunningCode;
  }, [isRunningCode])

  useEffect(() => {
    if (isRunningCode) {
      const timeoutId = setTimeout(() => {
        if (isRunningCodeRef.current) {
          setIsRunningCode(false);
          setErrorMessage(prev => prev.some(e => e.message === 'Failed to run code, Please Try again or check your network connection')
            ? prev
            : [...prev , {id: Date.now() , message:'Failed to run code, Please Try again or check your network connection'}]
          );
        }
      }, 60000);
      return () => clearTimeout(timeoutId);
    }
  }, [isRunningCode]);


  const handleSaveRoom = async() => {
    const user = auth.currentUser;
     if(!user){
      setErrorMessage(prev => prev.some(e => e.message === 'You must be signed in to save rooms.')
        ? prev
        : [...prev , {id: Date.now() , message:'You must be signed in to save rooms.'}]
      );
      return;
     }
    if (user) {
      const userDocRef = doc(db, "userRooms", user.uid);

      try {
        setIsLoading(true);
        const docSnap = await getDoc(userDocRef);
        let updatedRoomsMap = {};

        if (docSnap.exists()) {

          const existing = docSnap.data().rooms || {};

          updatedRoomsMap = {
              ...existing,
              [roomId]:{joinedAt: new Date().toISOString()}
          }
          
        } else {
          updatedRoomsMap = {
            [roomId]:{joinedAt:new Date().toISOString()}
          }
        }
        await setDoc(userDocRef, {
          userId: user.uid, 
          name: user.displayName,
          rooms: updatedRoomsMap,
        },{merge:true});

        setIsSaveRoom(true);
        socket.emit('mark-room-saved' , {roomId});
      } catch (err) {
        setIsSaveRoom(false);
        setIsLoading(false)
        console.error("Failed to save roomId to Firestore", err);
        setErrorMessage(prev => prev.some(e => e.message === 'Failed to save room - please check your connection.')
          ? prev
          : [...prev , {id: Date.now() , message:'Failed to save room - please check your connection.'}]
        );
      } finally{
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const handlePing = () => {
      socket.emit("pong-room" , socket.id);
    }

    socket.on("ping-room" , handlePing);

    return() => {
      socket.off("ping-room" , handlePing);
    }
  } , [])

  useEffect(() => {

    const handleUserStale = (staleUserId) => {
      if(staleUserId === socket.id){
        setIsStaleUser(true);
        if (interactedRef.current) {
          const audio = new Audio(RejoinTune);
          audio.volume = 0.2;
          audio.play().catch({});
        }
      }
    }

    socket.on("user-stale-disconnected" , handleUserStale);

    return () => {
      socket.off("user-stale-disconnected" , handleUserStale);
    }
  })

  const handleCloseModal = () => {
    setShowDownloadModal(false);
  }

  const stringToColor = (str) => {
    if (!str || typeof str !== "string") return "hsl(0, 0%, 50%)";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  };

  useEffect(() => {
    const handler = (e) => {
      const message = e?.message || "";

      const knownSafeErrors = [
        'ResizeObserver loop',
        'domNode',
        'this._renderer.value',
        'Script error',
        '_glyphMarginWidgets',
        '[object Event]',
      ];

      const shouldSuppress = knownSafeErrors.some((msg) => message.includes(msg));

      if (shouldSuppress) {
        e.preventDefault?.();
        e.stopImmediatePropagation?.();
        // In production, log this instead of hiding completely
        if (process.env.NODE_ENV === 'production') {
          console.warn('[Suppressed in Production]', message);
          // logErrorToService(message); // 🔧 your custom logger
        }
      } else {
        // Let unexpected errors bubble up
        console.error('[Unexpected Error]', message);
      }
    };

      const handleNetworkError = (event) => {
        const message = event?.message || "";
        if (message.includes("NetworkError: A network error occurred.") || message.includes("failed to fetch")) {
          event.preventDefault();
          console.warn("🌐 Network failed. Retrying or waiting...");
          

           setErrorMessage(prev => prev.some(e => e.message === '🔌 Network error. Please check your connection.')
            ? prev
            : [...prev , {id: Date.now() , message:'🔌 Network error. Please check your connection.'}]
          );
        }
      };

    window.addEventListener("Offline", handleNetworkError);
    window.addEventListener('error', handler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener("offline",handleNetworkError);
    }
  }, []);



  const sendChatMessage = () => {
    if(!chatInput.trim()) return;
    socket.emit('chat-message' , ({roomId , message:chatInput.trim() , name:userName}))
    setChatInput("");
  }

  const respondJoin = (requesterId , accepted) => {
    socket.emit("respond-join" , ({requesterId , accepted}))
      setPendingJoins(prev => prev.filter(r => r.requesterId !== requesterId))
  }

  const handleDataFromInvite = (create) => {
    if(create){
      setOpenShareRoomModal(false);
    }
  }

  const handleCloseLeaveModal = () => {
    setLeaveRoom(false);
  }

  const ErrorFromTerminal = (err) => {
     if(err){
      setErrorMessage(prev => prev.some(e => e.message === `${err}`)
        ? prev
        : [...prev , {id: Date.now() , message:`${err}`}]
      );
     }
  }

    useEffect(() => {
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.addEventListener('load', () => {
          iframe.contentWindow.document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
              e.preventDefault();
              const targetId = this.getAttribute('href');
              const target = iframe.contentWindow.document.querySelector(targetId);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            });
          });
        });
      }
    }, []);

    const generateHtmlWithInjectedCssJs = (htmlCode, allFiles, htmlFileName) => {
      if (!htmlFileName) return '';
      const base = htmlFileName.replace('.html', '');
      const cssFile = allFiles.find(f => f.name === `${base}.css`);
      const jsFile = allFiles.find(f => f.name === `${base}.js`);

      const cssTag = cssFile ? `<style>${cssFile.code}</style>` : '';
      const jsTag = jsFile ? `<script>${jsFile.code}</script>` : '';

      const protectIframeScript = `
        <script>
          document.addEventListener("click", function (e) {
            const target = e.target.closest("a, form, button");
            if (!target) return;

            const tag = target.tagName;
            const type = target.getAttribute("type");

            // Prevent all links
            if (tag === "A") {
              e.preventDefault();
            }

            // Prevent all form submissions
            if (tag === "FORM" || (tag === "BUTTON" && type === "submit")) {
              e.preventDefault();
            }
          }, true);
        </script>
      `;

      let finalHtml = htmlCode || '';

      // Inject CSS inside <head>
      finalHtml = finalHtml.replace('</head>', `${cssTag}\n</head>`);

      // Inject JS inside <body>
      finalHtml = finalHtml.replace('</body>', `${jsTag}\n${protectIframeScript}\n</body>`);

      return finalHtml;
    };

      const htmlPreview = useMemo(() => {
        if (!activeFile || !activeFile.endsWith('.html')) return '';
        const currentHtml = editorRef.current?.getValue();
        return generateHtmlWithInjectedCssJs(
          currentHtml,
          Object.entries(fileCodes).map(([name, code]) => ({ name, code })),
          activeFile
        );
      }, [fileCodes, activeFile]);

    const handleCloseErrorMessage = (id) => {
      setErrorMessage(prev => prev.filter(e => e.id !== id));
    };


  const getFileIconClass = (extension) => {
    const iconMap = {
      js: 'bi-filetype-js',
      ts: 'bi-filetype-tsx',
      py: 'bi-filetype-py',
      java: 'bi-filetype-java',
      cpp: 'bi-filetype-cpp',
      c: 'bi-filetype-c',
      cs: 'bi-filetype-cs',
      html: 'bi-filetype-html',
      css: 'bi-filetype-css',
      php: 'bi-filetype-php',
      go: 'bi-filetype-go',
      rb: 'bi-filetype-rb',
      rs: 'bi-filetype-rs',
      swift: 'bi-filetype-swift',
      sql: 'bi-filetype-sql',
    };
    
    return iconMap[extension] || 'bi-file-earmark';
  };

  return (
    <div>
     <Toast toasts={toasts} onDismiss={removeToast} CurrentUser={userName} />
     {pendingJoins.length > 0 && pendingJoins.map((req, i) => (
        <div 
          key={i} 
          className="join-request-toast-container"
          style={{
            bottom: `${20 + i * 100}px`,
            zIndex: 2000,
          }}
        >
          <div className="join-request-toast">
            <div className="toast-header">
              <div className="user-avatar">
                {req.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <strong>{req.name}</strong>
                <small>Wants to join</small>
              </div>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => setPendingJoins(prev => prev.filter(r => r.requesterId !== req.requesterId))}
              >
                &times;
              </button>
            </div>
            
            <div className="toast-actions">
              <button
                className="accept-btn"
                onClick={() => respondJoin(req.requesterId, true)}
              >
                <i className="bi bi-check-circle-fill"></i>
                Accept
              </button>
              <button 
                className="reject-btn"
                onClick={() => respondJoin(req.requesterId, false)}
              >
                <i className="bi bi-x-circle-fill"></i>
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}

      {isStaleUser && (
        <div className='user-disconnect-div position-absolute bottom-0 end-0 mb-3 mx-4'>
          ⚠️ You are not receiving updates. <br/>
          Please refresh the page to reconnect.
          <button
            className='user-disconnect-btn'
            onClick={() => window.location.reload()}
          >
            🔄 Refresh
          </button>
        </div>
      )}

        {SignInG && (
          <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }} >
            <div className="modal-dialog  modal-dialog-centered" role="document">
              <div className="modal-content bg-dark text-light">
                <div className="modal-header">
                  <h5 className="modal-title">Sign In</h5>
                  <button type="button" className="btn-close" onClick={() => setSignInG(false)} data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body p-0 my-5">
                  <div className='GoogleBtn'>
                    <GoogleSign onSuccess={setAuthSuccess} onError={setAuthError} />
                    <GitHubSing onSuccess={setAuthSuccess} onError={setAuthError} />
                    <EmailAuth onSuccess={setAuthSuccess} onError={setAuthError}/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {errorMessage.length > 0 && (
        <ShowError
          errorMessage={errorMessage}
          CloseErrorMessageModal={handleCloseErrorMessage}
        />
      )}
      {OpenShareRoomModal && <InviteRoom roomId={roomId} activeUsers={activeUsers} files={files} setErrorMessage={setErrorMessage} SendDataToEditor={handleDataFromInvite}/>}
      {showDownloadModal && <FilesDownloadModal CloseDownloadModal={handleCloseModal} files={files} yDocs={yDocs} fileCodes={fileCodes}/>}
      {LeaveRoom && <LeaveRoomModal LeaveRoom={LeaveRoom} CloseLeaveRoomModal={handleCloseLeaveModal} roomId={roomId} userName={userName}/>}
      {Kicked && <KickedUserModal Kicked={Kicked} CountDown={CountDown} setCountDown={setCountDown} />}
      {OpenDeleteFileModal.status && <OpenFileDeleteModal OpenDeleteFileModalStatus={OpenDeleteFileModal.status} CloseFileDeleteModal={()=>setOpenDeleteFileModal({status:false , FileName:''})} SetNewActiveFile={handleSetNewActiveFile} FileDeleteName={OpenDeleteFileModal.FileName} />}
      {IsFeedBackModelOpen && <FeedBackModel CloseFeedBackModel={()=>setIsFeedBackModelOpen(false)} UserName={userName}/>}
      {UserKickedConfiremation.status && <UserConfirmationKickeModel ModelStatus={UserKickedConfiremation.status} RoomId={roomId} CloseUserConfirmationModel={()=>{setUserKickedConfiremation({status:false , userName:'', userID:'',roomID:''})}} UserName={UserKickedConfiremation.userName} UserID={UserKickedConfiremation.userID}/>}

      <div className="main">
        <div className="nav p-1">
          <div className="LOGO">
            <img src={Logo} alt="Logo"/>
          </div>
          {/* Active Users Button */}
         <div className="active-users-dropdown ms-auto d-flex align-items-center gap-2 mx-2">
          <button onClick={()=>setIsFeedBackModelOpen(true)} className="Feedback"><i className="fa-solid fa-comment-dots"></i></button>
          <div className="dropdown-center">
            <button 
              className="btn btn-gradient dropdown-toggle user-panel-btn userPanelBtn" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i className="bi bi-people-fill me-2"></i>
              <span className="user-count-badge">{activeUsers?.length ?? 0}</span>
              Active Users
            </button>
            <ul className="dropdown-menu user-dropdown-menu">
              <div className="dropdown-header">
                <i className="bi bi-star-fill text-warning me-2"></i>
                <span className="admin-badge">{admin} (Admin)</span>
              </div>
              <div className="dropdown-divider"></div>
              {[...new Map(activeUsers.map(user => [user.id, user])).values()].map((user) => (
                user?.name ? (<div key={user.id} className="dropdown-item-wrapper">
                  <div className="user-item">
                    <div className="user-avatar" style={{ backgroundColor: stringToColor(user?.name) }}>
                      {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user && user.name ? user.name : 'Guest'}</span>
                      <small className="user-status text-success">
                        <i className="bi bi-circle-fill"></i> Online
                      </small>
                    </div>
                    {isCreator && admin !== user.name && (
                      <button
                        // onClick={() => socket.emit("remove-user", { roomId, userId: user.id })}
                        onClick={() => setUserKickedConfiremation({status:true , userName:user.name , roomID:roomId , userID:user.id})}
                        className="kick-btn"
                        title="Kick user"
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    )}
                  </div>
                </div>) : null
              ))}
            </ul>
          </div>
        </div>

        <MobileMenu 
          activeUsers={activeUsers} 
          ShowLeaveRoomModal={handleShowModalLeaveRoom} 
          OpenDownloadFilesModal={()=>setShowDownloadModal(true)} 
          OpenSignInModal={()=>setSignInG(true)} 
          user={user} 
          roomId={roomId} 
          admin={admin} 
          isCreator={isCreator} 
          ShareRoomModalOpen={()=>setOpenShareRoomModal(true)}
          OpenFeedbackModel={()=>setIsFeedBackModelOpen(true)}
        />

        </div>
        <div className="Editor-Page">
          <Select
            className="select-language"
            value={languageOptions.find(opt => opt.value === language)}
            onChange={opt => setLanguage(opt.value)}
            menuPortalTarget={document.body}
            options={languageOptions}
            isSearchable={false}
            styles={{
              control: (base) => ({
                ...base,
                minWidth: 85,
                backgroundColor: "#222",
                color: "#fff",
                borderColor: "#555",
                zIndex: 1000,
              }),
              singleValue: (base) => ({
                ...base,
                color: "#fff"
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#222",
                color: "#fff",
                zIndex: 9999,
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? "#333" : "#222",
                color: "#fff"
              })
            }}
          />

          <div className="d-flex">
            {window.innerWidth <= 600 && (
              <div className="btngroup" role="group" aria-label="View mode toggle">
                <input 
                  type="radio" 
                  className="groupBtn"
                  name="viewMode" 
                  id="editorView" 
                  checked={viewMode === "editor"}
                  onChange={() => setViewMode("editor")} 
                />
                <label htmlFor="editorView" className="btn-toggle">
                  <i className="bi bi-code-square"></i>
                  <span data-label="Editor">Editor</span>
                </label>

                <input 
                  type="radio" 
                  className="groupBtn" 
                  name="viewMode" 
                  id="terminalView" 
                  checked={viewMode === "terminal"}
                  onChange={() => {
                    setViewMode("terminal");
                  }}
                />
                <label htmlFor="terminalView" className="btn-toggle">
                  <i className="bi bi-terminal"></i>
                  <span data-label="Terminal">Terminal</span>
                </label>
              </div>
            )}
            {ishtml && 
              <button className="btn HTMLRUNbtn " onClick={() => {let value = '' ; if(editorRef.current?.getValue){value = editorRef.current.getValue()} setGethtml(value);}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">
                <i className="bi bi-code"></i>
                <span>Run HTML</span>
              </button>
            }
            {ishtml ?
              <button className="IRunHtml btn" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasTop" aria-controls="offcanvasTop">
                <i className="bi bi-code"></i>
              </button> 
              : isRunningCode ?
              <button className="IRun btn" type="button" disabled>
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
              </button>
              : 
              <button className={`IRun btn ${!ishtml ? 'd-flex' : 'd-none'}`} onClick={handleRunInTerminal}>
                <i className="bi bi-play-fill"></i>
              </button>
            }

            {!ishtml && isRunningCode ?
              <button className="RunInTerminal btn" type="button" disabled>
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span role="status">Running...</span>
              </button>
             :
              <button className={`RunInTerminal btn ${!ishtml ? 'd-flex' : 'd-none'}`} onClick={handleRunInTerminal}>
                <i className="bi bi-play-fill"></i>
                <span> Run in Terminal</span>
              </button>
            }

            <button 
              className="share-room btn gap-1"
              // onClick={handleShareRoom}
              onClick={() => setOpenShareRoomModal(true)}
            >
              <i className="bi bi-share-fill"></i>
              <span>Invite Friends</span>
            </button>

            <button className="btn ChatBTN" variant="primary" onClick={() =>{ setTimeout(()=> { chatPanelRef.current?.focus() }, 500); setIsChatOpen(true) ; setChatUnreadCount(0)}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
              <i className="bi bi-chat-fill mx-1"></i>
              <span>Open Chat</span> 
              {chatUnreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{chatUnreadCount}</span>
              )}
            </button>

            <button className="IChat btn" variant="primary" onClick={() =>{ setTimeout(()=> { chatPanelRef.current?.focus() }, 800) ; setIsChatOpen(true) ; setChatUnreadCount(0) ;}} type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasRight" aria-controls="offcanvasRight">
              <i className="bi bi-chat-fill mx-1"></i>
              {chatUnreadCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{chatUnreadCount}</span>
              )}
            </button>

            <button className="btn LeaveRoom" onClick={handleShowModalLeaveRoom}>
              <i className="bi bi-door-open-fill"></i>
              Leave Room
            </button>

            <button className='FileDownloadBtn' onClick={()=>setShowDownloadModal(true)} title="Download Files">
              <i className="bi bi-download"></i>
            </button>

            <div className="terminal-btn-container d-flex flex-1 position-absolute end-0">
              {isCreator && IsClosedBtnClickd && user ?
                 <div className={`${isSaveRoom ? 'd-none' : 'd-flex'}`} id="saveRoom">
                   {isLoading ?
                     <button className="btn alt-btn" type="button" disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status">Saving...</span>
                     </button> :
                       !RoomIdExist && 
                      <button className="btn alt-btn" onClick={handleSaveRoom} title="Save Room Data">
                          <i className="bi bi-bookmark"></i>
                       </button>}
                  </div>
              :  IsClosedBtnClickedSignIn &&
                <button className="btn alt-btn" onClick={() => setSignInG(true)} title='Sign In to Save Room'>
                  <i className="fas fa-sign-out-alt me-2"></i>
                </button>
              }
              <button className="terminalHide btn" onClick={()=>setTerminalHide(terminalHide ? false : true)}>
                {terminalHide ? 'Hide Terminal' : 'Show Terminal'}
              </button>
            </div>
          </div>
        </div>

          {isCreator && user ?
            <div className={`${isSaveRoom ? 'd-none' : 'd-flex'}`} id="saveRoom">
              {isLoading ?
              <div className="animated-signin-wrapper">
                <button className="animated-signin-btn" type="button" disabled>
                  <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                  <span role="status">Saving...</span>
                </button>
              </div> :
                 SaveRoomBtnClose && !RoomIdExist && <div className="animated-signin-wrapper ">
                    <button
                      className="close-btn"
                      onClick={() => {setSaveRoomBtnClose(false) ; setIsClosedBtnClickd(true)}}
                    >
                      &times;
                    </button>
                    <button className={`animated-signin-btn`} onClick={handleSaveRoom}>
                      <i className="bi bi-bookmark"></i>
                      <span>Save Room Data</span>
                    </button>
                </div>}
            </div> :         
              showSignIn && <div className="animated-signin-wrapper">
                <button
                  className="close-btn"
                  onClick={() => {setShowSignIn(false); setIsClosedBtnClickedSignIn(true)}}
                >
                  &times;
                </button>
                <button
                  onClick={() => setSignInG(true)}
                  className="animated-signin-btn"
                >
                  Sign In
                </button>
              </div>}
        <ChatPanel
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          chatUnreadCount={chatUnreadCount}
          chatMessage={chatMessage}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendChatMessage={sendChatMessage}
          activeUsers={activeUsers}
          userName={userName}
          PanelRef={chatPanelRef}
        />


        {/* HTML Run Canvas */}
          <div className="offcanvas offcanvas-top html-preview-fullscreen" tabIndex="-1" id="offcanvasTop" aria-labelledby="offcanvasTopLabel">
            <div className="browser-header">
              <div className="browser-controls">
                <div className="browser-buttons">
                  <span className="browser-btn browser-btn-close"></span>
                  <span className="browser-btn browser-btn-minimize"></span>
                  <span className="browser-btn browser-btn-expand"></span>
                </div>
                <div className="browser-url-bar">
                  <span>HTML Preview - {activeFile}</span>
                </div>
              </div>
              <button 
                type="button" 
                className="browser-close-btn" 
                data-bs-dismiss="offcanvas" 
                aria-label="Close"
                title="Close Preview"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="browser-content">
               {activeFile && activeFile.endsWith('.html') && (
                <iframe
                  title="Live Preview"
                  sandbox="allow-scripts"
                  style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'white',
                  }}
                  srcDoc={generateHtmlWithInjectedCssJs(
                    gethtml || '',
                    Object.entries(fileCodes).map(([name, code]) => ({ name, code })),
                    activeFile
                  )}
                />
              )}
            </div>
          </div>

        {/* Files Container  */}
        <div className="file-tabs-container">
          {files.map((file) => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const iconClass = getFileIconClass(fileExtension);
            
            return (
              <div 
                key={file.name}
                className={`file-tab ${fileExtension} ${activeFile === file.name ? 'active' : ''}`}
                onClick={() => handleFileChange(file.name)}
              >
                <i className={`file-icon bi ${iconClass}`}></i>
                <span className="file-name">{file.name}</span>
                <button 
                  className="file-close-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.name);
                  }}
                  title="Delete file"
                >
                  &times;
                </button>
              </div>
            );
          })}
          
          <button 
            className="new-file-btn" 
            type="button" 
            data-bs-toggle="modal" 
            data-bs-target="#exampleModal"
            ref={CreateFileBtnRef}
            onClick={() => setTimeout(() => {createFileInputRef.current?.focus()}, 500)}
            title="Create new file"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>

        {/* File Create Model */}
      
        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" >
          <div className="modal-dialog "style={{zIndex:1099}}>
            <div className="modal-content " >
              <div className="modal-header bg-dark text-light">
                <h1 className="modal-title fs-5" id="exampleModalLabel">Create New File</h1>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body bg-dark text-light">
                <form>
                  <div className="mb-3">
                    <label htmlFor="recipient-name" className="col-form-label">Enter File Name</label>
                    <input 
                      type="text"
                      className="form-control bg-dark text-light"
                      ref={createFileInputRef}
                      value={newFileName}
                      onChange={(e) => setNewFileName(e.target.value)}
                      placeholder="Enter file name (e.g., Main.java, index.html, etc...)"
                      onKeyDown={(e) => {
                        if( e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateFile();
                        }
                      }}
                      id="recipient-name"
                      autoFocus 
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer bg-dark text-light">
                <button
                  type="button" 
                  onClick={handleCreateFile}
                  className="createFilebtn mx-2 btn"
                  data-bs-dismiss="modal"
                >
                  Create
                </button>
                <button type="button" className="cancelFilebtn btn" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>

        {/* DesckTop User */}
        {window.innerWidth > 600 && !activeFile ? <div className="Loader"><LoadingSpinner/></div>: 
          <div className="editorPageContainer desktop-terminal-only">
            <div className="editorPanel">
              <div className="editor">
                {!isYjsSynced ? (
                  <div className="LoadingSpin d-flex position-absolute top-50 start-50">
                    <Loading />
                    <div className='text-light'>Syncing File...</div>
                  </div>
                ) :(
                  <Editor
                    key={activeFile + '-' + viewMode}
                    // key={activeFile}
                    height="100%"
                    language={language}
                    theme= 'vs-dark'
                    path={activeFile}
                      // defaultValue={fileCodes[activeFile] || "// Loading..."}
                    // value={fileCodes[activeFile] ?? "// Loading..."}
                    onMount={handleEditorDidMount}
                    onChange={handleChange}
                    loading={<div className="LoadingSpin position-absolute top-50 start-50"><Loading /></div>}
                    options={{
                      fontFamily: 'Fira Code, monospace',
                      fontSize: 14,
                      lineHeight: 21,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      wordWrap: "on",
                      cursorWidth: 2,
                      cursorSmoothCaretAnimation: true,
                      fontLigatures: true,
                      suggestOnTriggerCharacters: true,
                      quickSuggestions: true,
                      scrollBeyondLastColumn: 5,
                      padding: { bottom: 140 },
                      // readOnly: !isYjsSynced,
                    }}
                  />
                )}
              </div>
              {terminalHide && <div>
                <div 
                  className="terminPanel" 
                  onMouseDown={handleDragMouseDown}
                  style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: `${terminalHeight}px`,
                    zIndex: 101,
                    background: "#444",
                    cursor: "ns-resize",
                  }}
                />
                <div className="terminal" ref={terminalRef} style={{ height: `${terminalHeight}px`, minHeight: '150px' }}>
                  <TerminalE
                  code={liveEditorCode}
                    // code={fileCodes[activeFile] || ''}
                    language={language}
                    runTrigger={runInTerminal}
                    fitTrigger={fitTrigger}
                    onCodeOutput={()=> setIsRunningCode(false)}
                    OnTerminalError={ErrorFromTerminal}
                  />
                </div>
              </div>}
            </div>
          </div>
        }
      
        {/* For mobile */}
        {window.innerWidth <=600 && !activeFile ? <div className="Loader"><LoadingSpinner/></div> :
          <div className="mobile-view-container">
            {viewMode === "editor" &&  (
              <div className="editor-panel">
                {!isYjsSynced ? (
                  <div className="LoadingSpin position-absolute top-50 start-50 text-center">
                    <Loading />
                    <div style={{ marginTop: '10px' }}>Syncing File...</div>
                  </div>
                ) : (
                <Editor
                  key={activeFile + '-' + viewMode}
                  // key={activeFile}
                  height="100%"
                  language={language}
                  theme="vs-dark"
                  path={activeFile}
                  onMount={handleEditorDidMount}
                  onChange={handleChange}
                  loading={<div className="LoadingSpin position-absolute top-50 start-50"><Loading /></div>}
                  options={{ 
                    fontSize: 14,
                    minimap: { enabled: false },
                    automaticLayout: true,
                    wordWrap: "on",
                    scrollBeyondLastColumn: 5,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    scrollBeyondLastLine:true,
                    // readOnly: !isYjsSynced,
                    horizontal: "auto",
                    scrollbar: {
                      horizontal: "auto",
                      useShadows: false,
                    }
                  }}
                />
               )}
              </div>
            )}
            {viewMode === "terminal" && (
              <div className="mobile-terminal-panel">
                <TerminalE
                  code={liveEditorCode}
                  // code={fileCodes[activeFile] || ""}
                  language={language}
                  runTrigger={runInTerminal}
                  fitTrigger={fitTrigger}
                  onCodeOutput={()=> setIsRunningCode(false)}
                  OnTerminalError={ErrorFromTerminal}
                />
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
}

export default EditorPage;
