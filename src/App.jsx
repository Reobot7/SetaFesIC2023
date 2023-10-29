
import './App.css'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc,setDoc,deleteDoc,serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyC3CjfPL2JCGKIO3WCvEnnPmYT8YBm7faE",
  authDomain: "setafesic2023.firebaseapp.com",
  projectId: "setafesic2023",
  storageBucket: "setafesic2023.appspot.com",
  messagingSenderId:"716883567683",
  appId: "1:716883567683:web:c6a2dc8584a37cb8cfe0f6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

function Settings({ setLocation }) {
  const navigate = useNavigate();
  
  const handleLocationSelect = (location) => {
    console.log(location);
    setLocation(location);
    navigate("/waiting");
  };

  const goToCheckResultWaiting = () => {
    navigate("/checkresultwaiting");
  };

  return (
    <div>
      <Header/>
      <button onClick={() => handleLocationSelect(1)}>1</button>
      <button onClick={() => handleLocationSelect(2)}>2</button>
      <button onClick={() => handleLocationSelect(3)}>3</button>
      <button onClick={() => handleLocationSelect(4)}>4</button>
      <button onClick={() => handleLocationSelect(5)}>5</button>
      <button onClick={goToCheckResultWaiting}>結果確認待機画面に遷移</button>
    </div>
  );
}

function WaitingScreen({ setNFCData, websocket, location }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({ command: "start_nfc" }));  // waiting画面に遷移したときにstart_nfc信号を送る
    }

    const handleDataReceived = (message) => {
      const data = JSON.parse(message.data);
      console.log('Received:', data);

      if (data.type === "nfc_data") {
        setNFCData(data);
        navigate("/loading");
      }
    };

    websocket.addEventListener("message", handleDataReceived);

    return () => {
      websocket.removeEventListener("message", handleDataReceived);
    };
  }, [setNFCData, websocket, navigate]);

  const getLocationName = () => {
    switch(location) {
      case 1:
        return "1号館";
      case 2:
        return "72B教室";
      case 3:
        return "6号館";
      case 4:
        return "7号館";
      case 5:
        return "9号館";
      default:
        return "";
    }
  }

  return (
    <div>
      <Header />
      <div>現在の場所: {getLocationName()}</div>
      <img src={`${window.location.origin}/C2622.png`} />
      <div className="message-waiting">ICカードをタッチしてください</div>
    </div>
  );
}


  function LoadingScreen({ nfcData, setNFCResult, location }) {
    const navigate = useNavigate();
    console.log(location);
    
    useEffect(() => {
      const fetchData = async () => {
        const docRef = doc(db, 'nfcIDs', nfcData.data);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          // 既存のドキュメントを更新
          await setDoc(docRef, {
            [location]: {
              state: true, 
              timestamp: serverTimestamp()
            }
          }, { merge: true }); // データをマージして更新
        } else {
          // 新しいドキュメントを作成
          await setDoc(docRef, {
            [location]: {
              state: true, 
              timestamp: serverTimestamp()
            }
          });
        }
        const docSnap_result = await getDoc(docRef);
        setNFCResult(docSnap_result.data());
        const timer = setTimeout(() => {
          navigate("/result");
          }, 2000);  // 5秒後に遷移
      };
  
      if (nfcData && nfcData.data) {
        fetchData();
      }
    }, [nfcData, setNFCResult, navigate, location]);
  
    return (
      <div>
      <Header /> 
      <img src={`${window.location.origin}/D8739.png`}/>
    </div>);
  }


  function ResultScreen({ nfcResult }) {
    const navigate = useNavigate();

    useEffect(() => {
      const timer = setTimeout(() => {
        navigate("/waiting");
      }, 5000);  // 5秒後に遷移
  
      return () => clearTimeout(timer); // コンポーネントのアンマウント時にタイマーをクリア
    }, [navigate]);
    

    return (
        <div>
          <Header /> 
          <table>
            <tbody>
            <tr>
        <td className="table-cell">1号館</td>
        <td className="table-cell">72B教室</td>
        <td className="table-cell">6号館</td>
        <td className="table-cell">7号館</td>
        <td className="table-cell">9号館</td>
      </tr>
      <tr>
        <td className="table-cell"> {nfcResult && nfcResult[1] && nfcResult[1].state? "OK" : ""}</td>
        <td className="table-cell"> {nfcResult && nfcResult[2] && nfcResult[2].state? "OK" : ""}</td>
        <td className="table-cell"> {nfcResult && nfcResult[3] && nfcResult[3].state? "OK" : ""}</td>
        <td className="table-cell"> {nfcResult && nfcResult[4] && nfcResult[4].state? "OK" : ""}</td>
        <td className="table-cell"> {nfcResult && nfcResult[5] && nfcResult[5].state? "OK" : ""}</td>
      </tr>
            </tbody>
          </table>
        </div>
      );

  }

  // CheckResultWaitingScreen
function CheckResultWaitingScreen({ setNFCData, websocket }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify({ command: "start_nfc" })); // 結果確認用のnfc開始信号
    }

    const handleDataReceived = (message) => {
      const data = JSON.parse(message.data);
      console.log('Received:', data);

      if (data.type === "nfc_data") {
        setNFCData(data);
        navigate("/checkresultloading");
      }
    };

    websocket.addEventListener("message", handleDataReceived);

    return () => {
      websocket.removeEventListener("message", handleDataReceived);
    };
  }, [setNFCData, websocket, navigate]);

  return (
    <div>
      <Header />
      <img src={`${window.location.origin}/C2622.png`} />
      <div className="message-waiting">結果を確認するためにICカードをタッチしてください</div>
    </div>
  );
}

// CheckResultLoadingScreen
function CheckResultLoadingScreen({ nfcData, setNFCResult }) {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'nfcIDs', nfcData.data);
      const docSnap = await getDoc(docRef);
      

      const docSnap_result = await getDoc(docRef);
      setNFCResult(docSnap_result.data());
      const timer = setTimeout(() => {
        navigate("/checkresult");
      }, 2000);
    };

    if (nfcData && nfcData.data) {
      fetchData();
    }
  }, [nfcData, setNFCResult, navigate]);

  return (
    <div>
      <Header />
      <img src={`${window.location.origin}/D8739.png`}/>
      <div className="message-loading">結果を読み取り中...</div>
    </div>
  );
}

function CheckResultScreen({ nfcResult,nfcData }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/checkresultwaiting");
    }, 5000); // 5秒後に結果確認専用の待機画面に遷移

    return () => clearTimeout(timer);
  }, [navigate]);

  // OKの数を数える
  const okCount = [1, 2, 3, 4, 5].filter(num => nfcResult && nfcResult[num] && nfcResult[num].state).length;
  console.log(nfcResult)
  // Firestoreからの結果を削除
  const deleteResultFromFirestore = async () => {
    const docRef = doc(db, 'nfcIDs', nfcData.data); 
    await deleteDoc(docRef);
  };
  deleteResultFromFirestore(); // 削除処理を呼び出し

  return (
    <div>
      <Header /> 
      <h2>結果発表</h2>
      <p>{`5個中${okCount}個のOKがあります。`}</p>
      <table>
      <tbody>
          <tr>
            <td className="table-cell">1号館</td>
            <td className="table-cell">72B教室</td>
            <td className="table-cell">6号館</td>
            <td className="table-cell">7号館</td>
            <td className="table-cell">9号館</td>
          </tr>
          <tr>
            <td className="table-cell"> {nfcResult && nfcResult[1] && nfcResult[1].state ? "OK" : ""}</td>
            <td className="table-cell"> {nfcResult && nfcResult[2] && nfcResult[2].state ? "OK" : ""}</td>
            <td className="table-cell"> {nfcResult && nfcResult[3] && nfcResult[3].state ? "OK" : ""}</td>
            <td className="table-cell"> {nfcResult && nfcResult[4] && nfcResult[4].state ? "OK" : ""}</td>
            <td className="table-cell"> {nfcResult && nfcResult[5] && nfcResult[5].state ? "OK" : ""}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

  function Header() {
    return (
      <header>
        <h1>ICトレジャーハント</h1>
      </header>
    );
  }


function App() {
  const [location, setLocation] = useState(null);
  const [nfcData, setNFCData] = useState(null);
  const [nfcResult, setNFCResult] = useState(null);
  const [nfcCheckResult, setNFCCheckResult] = useState(null);
 
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8765');
  
    ws.onopen = () => {
      console.log('Connected to the WebSocket server');
      ws.send(JSON.stringify({ command: "start_nfc" }));
    };
    
    ws.onclose = () => {
      console.log('Disconnected from the WebSocket server');
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
  
    setWebsocket(ws);
  
    return () => {
      ws.close();
    };
  }, [location]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Settings setLocation={setLocation} />} />
        <Route path="/waiting" element={<WaitingScreen setNFCData={setNFCData} websocket={websocket} location={location}/>} />
        <Route path="/loading" element={<LoadingScreen nfcData={nfcData} setNFCResult={setNFCResult} location={location} />} />
        <Route path="/result" element={<ResultScreen nfcResult={nfcResult} />} />
        <Route path="/checkresultwaiting" element={<CheckResultWaitingScreen setNFCData={setNFCData} websocket={websocket} />} />
          <Route path="/checkresultloading" element={<CheckResultLoadingScreen nfcData={nfcData} setNFCResult={setNFCResult} />} />
            <Route path="/checkresult" element={<CheckResultScreen nfcResult={nfcResult} nfcData={nfcData} />} />
      </Routes>
    </Router>
  );
}

export default App;
