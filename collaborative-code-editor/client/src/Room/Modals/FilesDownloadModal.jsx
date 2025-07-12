import React, { useState } from 'react';
import JSZip from "jszip";
import '../Styles/FilesDownloadModal.css';

export default function FilesDownloadModal(props) {
    const [selectedDownloads, setSelectedDownloads] = useState([]);
    
    const toggleFileSelect = (fileName) => {
        setSelectedDownloads(prev => 
            prev.includes(fileName) ?
                prev.filter(f => f !== fileName) :
                [...prev, fileName]
        );
    };

    const handleDownloadSelectedFiles = () => {
        selectedDownloads.forEach(fileName => {
            let code = "";
            const ydoc = props.yDocs.current[fileName];
            if(ydoc){
                code = ydoc.getText('monaco').toString();
            } else {
                code = props.fileCodes[fileName] || "";
            }

            const blob = new Blob([code], {type:'text/plain'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        props.CloseDownloadModal(false);
        setSelectedDownloads([]);
    };

    const handleDownloadFileZip = async() => {
        const zip = new JSZip();

        for(const file of props.files){
            const fileName = file.name;
            let code = "";

            const ydoc = props.yDocs.current[fileName];
            if(ydoc){
                code = ydoc.getText('monaco').toString();
            } else {
                code = props.fileCodes[fileName] || '';
            }

            zip.file(fileName, code);
        }

        try {
            const content = await zip.generateAsync({type:'blob'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "My-Project-Files.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(err) {
            console.error("Zip download failed:", err);
        }
    };

    const getFileIcon = (language) => {
        switch(language) {
            case 'javascript': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg';
            case 'typescript': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg';
            case 'html': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg';
            case 'css': return '🎨';
            case 'python': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg';
            case 'java': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg';
            case 'cpp': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/cplusplus/cplusplus-original.svg';
            case 'c': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/c/c-original.svg';
            case 'go': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg';
            case 'php': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/php/php-original.svg';
            case 'ruby': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/ruby/ruby-original.svg';
            case 'rust': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-plain.svg';
            case 'csharp': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/csharp/csharp-original.svg';
            case 'dart': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg';
            case 'swift': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/swift/swift-original.svg';
            case 'sql': return 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg';
            default: return '📄';
        }
    };

    const getFileType = (language) => {
        switch(language) {
            case 'javascript': return 'JavaScript File';
            case 'typescript': return 'TypeScript File';
            case 'html': return 'HTML File';
            case 'css': return 'CSS File';
            case 'python': return 'Python File';
            case 'java': return 'Java File';
            case 'cpp': return 'C++ File';
            case 'c': return 'C File';
            case 'go': return 'Go File';
            case 'php': return 'PHP File';
            case 'ruby': return 'Ruby File';
            case 'rust': return 'Rust File';
            case 'csharp': return 'C# File';
            case 'dart': return 'Dart File';
            case 'swift': return 'Swift File';
            case 'sql': return 'SQL File';
            default: return 'Text File';
        }
    };

    return (
        <div className="download-modal-backdrop">
            <div className="download-modal-content">
                <div className="download-modal-header">
                    <h2 className="download-modal-title">Download Files</h2>
                    <button 
                        className="download-modal-close-btn"
                        onClick={() => props.CloseDownloadModal(false)}
                    >
                        &times;
                    </button>
                </div>
                
                <div className="download-modal-body">
                    <ul className="download-file-list">
                        {props.files.map((file) => (
                            <li 
                                key={file.name} 
                                className={`download-file-item ${selectedDownloads.includes(file.name) ? 'selected' : ''}`}
                                onClick={() => toggleFileSelect(file.name)}
                            >
                                <input
                                    type="checkbox"
                                    className="download-file-checkbox"
                                    checked={selectedDownloads.includes(file.name)}
                                    onChange={() => {}}
                                />
                                {selectedDownloads.includes(file.name) && (
                                    <span className="download-file-checkmark">✓</span>
                                )}
                                <div className="download-file-icon">
                                    <img src={getFileIcon(file.language || '')}/>
                                </div>
                                <div className="download-file-info">
                                    <div className="download-file-name">{file.name}</div>
                                    <div className="download-file-type">{getFileType(file.language || '')}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="download-modal-footer">
                    <span className="download-selection-counter">
                        {selectedDownloads.length} file{selectedDownloads.length !== 1 ? 's' : ''} selected
                    </span>
                    <button 
                        className="download-btn download-btn-primary"
                        onClick={handleDownloadSelectedFiles}
                        disabled={selectedDownloads.length === 0}
                    >
                        <span className="download-btn-icon"><i className="bi bi-download"></i></span>
                        Download Selected
                    </button>
                    <button 
                        className="download-btn download-btn-secondary"
                        onClick={handleDownloadFileZip}
                    >
                        <span className="download-btn-icon"><i className="bi bi-file-zip"></i></span>
                        Download as ZIP
                    </button>
                    <button 
                        className="download-btn download-btn-outline"
                        onClick={() => props.CloseDownloadModal(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}