import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { io } from "socket.io-client";
import { debounce } from "lodash";
import { useParams , useSearchParams } from "react-router-dom";
import Loading from "./Loading";
import 'bootstrap-icons/font/bootstrap-icons.css';

const socket = io("http://localhost:4000", {
  withCredentials: true,
});

function EditorPage() {
  const { roomId } = useParams();
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [fileCodes, setFileCodes] = useState({});
  const [newFileName, setNewFileName] = useState("");
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const userName = searchParams.get('name') || 'Anonymous';
  const [activeUsers, setActiveUsers] = useState([]);



  // Debounced emit with 250ms delay
  const emitChange = useRef(
    debounce((value, fileName) => {
      socket.emit("code-change", {
        roomId,
        fileName,
        code: value
      });
    }, 250)
  ).current;

  useEffect(() => {
    // Initialize socket connection
    socket.emit("join-room", { roomId , name: userName});
    console.log("Joining room for Some Chaking");

    socket.on("active-users", (users) => {
      console.log("Active users:", users);
      setActiveUsers(users);
    });

    const handleFilesData = (filesData) => {
    // Defensive: ensure filesData is always an array
    if (!Array.isArray(filesData)) {
      console.error("Received filesData is not an array:", filesData);
      setFiles([]);
      return;
    }
    setFiles(filesData);

    // Initialize fileCodes state
    const initialFileCodes = {};
    filesData.forEach(file => {
      initialFileCodes[file.name] = file.code;
    });
    setFileCodes(initialFileCodes);

    // Only set activeFile if it's not already set or if the current activeFile doesn't exist in the new files
    if (!activeFile || !filesData.some(f => f.name === activeFile)) {
      setActiveFile(filesData[0]?.name || null);
    }
  };

    const handleCodeUpdate = ({ fileName, code }) => {
      setFileCodes(prev => ({
        ...prev,
        [fileName]: code,
      }));
      // Update editor if it's the active file and mounted
      // if (fileName === activeFile && isEditorMounted && editorRef.current) {
      //   const currentVal = editorRef.current.getValue();
      //   if (currentVal !== code) {
      //     editorRef.current.setValue(code);
      //   }
      // }
    };

    

    socket.on("files-data", handleFilesData);
    socket.on("code-update", handleCodeUpdate);

    return () => {
      socket.off("files-data" , handleFilesData);
      socket.off("code-update", handleCodeUpdate);
      socket.off("active-users");
    };
  }, [roomId , activeFile , userName, isEditorMounted]);

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.endsWith('.js') ? newFileName : `${newFileName}.js`;
    socket.emit("create-file", { 
      roomId, 
      fileName,
      language: "javascript"
    });
    
    setNewFileName("");
    setShowCreateFile(false);
  };

    const handleDeleteFile = (fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    socket.emit("delete-file", { roomId, fileName });

    // Optimistically update UI
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setFileCodes(prev => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });

    if (activeFile === fileName) {
      const otherFile = files.find(f => f.name !== fileName);
      setActiveFile(otherFile?.name || null);
    }
  };


  const handleShareRoom = () => {
  const fullUrl = `${window.location.origin}`;
  const roomPath = `${fullUrl}\nRoom ID: ${roomId}`;
    navigator.clipboard.writeText(roomPath)
    .then(() => alert(`Room link copied to clipboard! : ${roomPath}`))
    .catch(() => alert("Failed to copy link."));
};



const handleFileChange = async (fileName) => {
  try {
    setIsLoading(true);
    // Save current file's content before switching
    console.log("Chaking Some data If exist " , editorRef.current.getValue() ,"And" , activeFile )
    if (editorRef.current && activeFile) {
      console.log("Saving current file's content before switching");
      const currentCode = editorRef.current.getValue();
      setFileCodes(prev => ({
        ...prev,
        [activeFile]: currentCode
      }));
      emitChange(currentCode, activeFile);
    }

    // Switch to new file
    setActiveFile(fileName);
    
    // Set the language for the new file
    const selectedFile = files.find(f => f.name === fileName);
    if (selectedFile) {
      setLanguage(selectedFile.language || "javascript");
    }

  } catch (err) {
    console.error("Error switching files:", err);
  }finally{
    setIsLoading(false);
  }
};

  const handleEditorDidMount = (editor) => {
  editorRef.current = editor;
  setIsEditorMounted(true);
  // try {
  //   if (activeFile) {
  //     editor.setValue(fileCodes[activeFile] || "// Loading...");
  //   } else if (files.length > 0) {
  //     setActiveFile(files[0].name);
  //     editor.setValue(fileCodes[files[0].name] || "// Loading...");
  //   }
  // } catch (err) {
  //   console.error("Error setting editor value:", err);
  // }
};

useEffect(() => {
  return () => {
    if (editorRef.current) {
      editorRef.current.dispose();
      editorRef.current = null;
    }
  };
}, []);

  const handleChange = (value) => {
     console.log("just for chaking")
    if (!activeFile) return;
    console.log("📤 Emmiting data ", value , "from file " , activeFile );
    // Update local state
    setFileCodes(prev => ({
      ...prev,
      [activeFile]: value
    }));
    
    // Emit changes to server
    emitChange(value, activeFile);
  };

  const handleRunCode = async () => {
    if (!activeFile) return;
    
    const codeToRun = fileCodes[activeFile] || "";
    setOutput("Running code...");

    try {
      const response = await fetch("http://localhost:4000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeToRun,
          language,
          input: inputText, 
        }),
      });
      const data = await response.json();
      setOutput(data.output || "No output returned");
    } catch (err) {
      console.error("❌ Error running code:", err.message);
      setOutput("Error running code");
    }
  };

  return (
    <div>
      <div style={{ padding: 10, background: "#1e1e1e", color: "white" }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: "5px 10px" }}
        >
          <option value="javascript">Javascript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
        </select>

        <button 
          onClick={handleRunCode} 
          style={{ 
            marginLeft: 10,
            padding: "5px 10px",
            background: "#007acc",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Run Code
        </button>
        <button 
          onClick={() => handleShareRoom()}
          style={{
            marginLeft: 10,
            padding: "5px 10px",
            background: "#ffa500",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          Share Room
        </button>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter custom input (stdin)..."
          rows={5}
          style={{
            width: "100%",
            marginTop: 10,
            padding: 10,
            background: "#1e1e1e",
            color: "white",
            border: "1px solid #333",
            borderRadius: 4,
            fontFamily: "monospace",
          }}
        />
      <pre
        style={{
          marginTop: 10,
          whiteSpace: "pre-wrap",
          background: "#252526",
          padding: 10,
          borderRadius: 4,
          color: output.includes("error") || output.includes("Exception") ? "#f44336" : "#4CAF50",
        }}
      >
        {output}
      </pre>

      </div>


      <div className="position-absolute top-0 end-0 p-2">
         <div class="dropdown-center">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Active Users
          </button>
          <ul class="dropdown-menu bg-dark text-center">
              {[...new Map(activeUsers.map(user => [user.id, user])).values()].map((user) => (
                <div className="d-flex align-items-center text-center p-2">
                  <div style={{color:'#4CAF50'}} ><i className="bi bi-code-square"></i></div>
                  <li><span className="text-light dropdown-item " style={{ background: "transparent" }} key={user.id} >{user.name}</span></li>
                </div>
              ))}
          </ul>
        </div>
      </div>
      <div style={{ display: "flex", background: "#2d2d2d", padding: 10, alignItems: "center", flexWrap: "wrap" }}>
        {files.map((f) => (
          <div key={f.name} style={{ display: 'flex', alignItems: 'center', marginRight: 10 }}>
          <button
            onClick={() => handleFileChange(f.name)}
            style={{
              // marginRight: 10,
              marginBottom: 5,
              background: activeFile === f.name ? "#1e1e1e" : "#555",
              color: "white",
              padding: "5px 10px",
              border: "none",
              borderTopLeftRadius: 4,
              borderBottomLeftRadius: 4,
              cursor: "pointer"
            }}
          >
            {f.name}
          </button>
               <button
                onClick={() => handleDeleteFile(f.name)}
                style={{
                  background: activeFile === f.name ? "#1e1e1e" : "#555",
                  color: "white",
                  border: "none",
                  marginBottom: 5,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                  padding: "5px 10px",
                  borderRadius: "",
                  width: 21,
                  height: 34,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Delete file"
              >
                ❌
              </button>
          </div>
        ))}
        
        <button 
          onClick={() => setShowCreateFile(true)}
          style={{
            marginRight: 10,
            marginBottom: 5,
            background: "#4CAF50",
            color: "white",
            padding: "5px 10px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer"
          }}
        >
          + New File
        </button>

        {showCreateFile && (
          <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name (e.g., script.js)"
              style={{
                padding: "5px 10px",
                marginRight: 10,
                borderRadius: 4,
                border: "none"
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFile()}
            />
            <button 
              onClick={handleCreateFile}
              style={{
                background: "#4CAF50",
                color: "white",
                padding: "5px 10px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                marginRight: 10
              }}
            >
              Create
            </button>
            <button 
              onClick={() => setShowCreateFile(false)}
              style={{
                background: "#f44336",
                color: "white",
                padding: "5px 10px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
      <div style={{ height: "calc(100vh - 150px)" }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          key={activeFile || "empty"} // Key forces remount when file changes
          value={activeFile ? (fileCodes[activeFile] || "// Loading...") : "// Select a file"}
          onMount={handleEditorDidMount}
          onChange={handleChange}
          loading={<div style={{background: "#252526", display: "flex", alignItems: "center", justifyContent: "center"}} className="bg-dark h-100 w-100 position-absolute top-50 start-50 translate-middle"><Loading/></div>}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

export default EditorPage;
