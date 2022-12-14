import { useState, useEffect, useRef } from "react";
import { FileDrop } from "react-file-drop";
import FadeLoader from "react-spinners/FadeLoader";
import axios from "axios";
import classNames from "classnames";
import "./index.css";

function App() {
    const styles = {};
    const [fileList, setFileList] = useState([]);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [emailNumbers, setEmailNumbers] = useState([]);

    const handle = (data) => {
        setFileList((previous) => previous.concat(Object.values(data)));
        return false;
    };

    useEffect(() => {
        setMessage("");
        const reader = new FileReader();
        const readFile = async (index, result, emailNumbers) => {
            if (index >= fileList.length) {
                setEmails(result.map((email) => email?.replace("\r", "")));
                setEmailNumbers(emailNumbers);
                return;
            }

            const file = fileList[index];
            reader.onload = async (e) => {
                const text = e.target?.result;
                const emailList = text ? text.trim().split("\n") : [];
                result = result?.length ? [...result, ...emailList] : emailList;
                emailNumbers.push(emailList.length);
                await readFile(index + 1, result, emailNumbers);
            };
            reader.readAsBinaryString(file);
        };
        readFile(0, [], []);
    }, [fileList]);

    const removeFile = (selectedIndex) => {
        const resultFiles = fileList.filter(
            (value, index) => index !== selectedIndex,
        );
        setFileList(resultFiles);
    };

    const removeEmail = (selectedIndex) => {
        const resultEmails = emails.filter(
            (value, index) => index !== selectedIndex,
        );
        setEmails(resultEmails);
    };

    const sendEmails = async () => {
        setLoading(true);
        setFileList([]);
        try {
            await axios.post(
                "https://toggl-hire-frontend-homework.onrender.com/api/send",
                {
                    emails,
                },
            );
            setMessage("Successfully sent!");
            setError("");
        } catch (err) {
            setError(err.response.data.error);
            setEmails(
                err.response.data?.emails ? err.response.data?.emails : [],
            );
            if (err.response.data.error === "invalid_email_address") {
                setMessage("Invalid Email error!");
            } else if (err.response.data.error === "send_failure") {
                setMessage("Network Error! Please resend emails");
            } else {
                setMessage("Server Internal Error!");
            }
        }
        setLoading(false);
    };

    return (
        <div>
            {loading && (
                <div className="loader-container">
                    <FadeLoader cssOverride={{ top: "50%", left: "50%" }} />
                </div>
            )}
            <div className="upload-file-wrapper" style={styles}>
                <FileDrop onDrop={(files, event) => handle(files)}>
                    <p>Drag and Drop / Browse Text files that contain emails</p>
                    <label htmlFor="same" className="browse-btn">
                        Browse Files
                        <input
                            id="same"
                            type="file"
                            multiple
                            onChange={(e) => {
                                handle(e.target.files);
                                e.target.value = null;
                            }}
                        />
                    </label>
                </FileDrop>
            </div>

            {!message && fileList?.length > 0 && (
                <div className="file-list">
                    <h3>File List</h3>
                    <ul>
                        <li key={`file-header`}>
                            File Name<span>Email Number</span>
                            <span>Action</span>
                        </li>
                        {fileList?.length > 0 &&
                            fileList.map((fileData, index) => (
                                <li key={`file-${index}`}>
                                    ${fileData.name}
                                    <span>{`emails: ${
                                        emailNumbers[index]
                                            ? emailNumbers[index]
                                            : 0
                                    }`}</span>
                                    <span
                                        className="cancel"
                                        onClick={(e) => removeFile(index)}
                                    >
                                        &#128473;
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
            {message && (
                <div
                    className={classNames({
                        message: true,
                        success: !error,
                        error: error,
                    })}
                >
                    {message}
                </div>
            )}
            {emails?.length > 0 && (
                <div className="email-list">
                    <div className="email-list-header">
                        <h3>Email List</h3>
                        <button
                            onClick={(e) => sendEmails()}
                            className="browse-btn"
                        >
                            Send Emails
                        </button>
                    </div>
                    <ul>
                        {emails?.length > 0 &&
                            emails.map((email, index) => (
                                <li key={`email-${index}`}>
                                    {email}
                                    <span
                                        className="cancel"
                                        onClick={(e) => removeEmail(index)}
                                    >
                                        &#128473;
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default App;
