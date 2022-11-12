import { useState, useEffect } from "react";
import { FileDrop } from "react-file-drop";
import './index.css';

function App() {
  const styles = {};
  const [fileList, setFileList] = useState([]);
  const [emailList, setEmailList] = useState([]);

  const handle = (data) => {
    setFileList(previous => previous.concat(Object.values(data)));
  };

  useEffect(() => {
    const reader = new FileReader();
    const readFile = async (index, result) => {
      if (index >= fileList.length) {
        return setEmailList(result.map(email => email?.replace("\r", "")));
      } 

      const file = fileList[index];
      reader.onload = async (e) => {
        const text = e.target.result;
        result = result?.length ? [...result, ...text.trim().split("\n")] : [...text.trim().split("\n")];
        await readFile(index + 1, result);
      }
      reader.readAsBinaryString(file);
    }
    readFile(0, []);    
  }, [fileList]);

  const removeFile = (selectedIndex) => {
    const resultFiles = fileList.filter((value, index) => index !== selectedIndex);
    setFileList(resultFiles)
  }

  const removeEmail = (selectedIndex) => {
    const resultEmails = emailList.filter((value, index) => index !== selectedIndex);
    setEmailList(resultEmails)
  }

  return (
    <div>
      <div className="upload-file-wrapper" style={styles}>
        <FileDrop onDrop={(files, event) => handle(files)}>
          <p>Drag and Drop / Browse Files that contain emails</p>
          <label htmlFor="same" className="browse-btn">
            Browse Files
            <input
              id="same"
              type="file"
              multiple
              onChange={(e) => handle(e.target.files)}
            ></input>
          </label>
        </FileDrop>
      </div>
      <div className="file-list">
        <h3>File List</h3>
        <ul>
          {fileList?.length > 0 && fileList.map((fileData, index) => <li key={`file-${index}`}>{fileData.name}<span className="cancel" onClick={(e) => removeFile(index)}>&#128473;</span></li>)}
        </ul>
      </div>

      <div className="email-list">
        <h3>Email List</h3>
        <ul>
          {emailList?.length > 0 && emailList.map((email, index) => <li key={`email-${index}`}>{email}<span className="cancel" onClick={(e) => removeEmail(index)}>&#128473;</span></li>)}
        </ul>
      </div>
    </div>
  );
}

export default App;
