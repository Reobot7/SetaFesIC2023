import './App.css'
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc,setDoc,serverTimestamp } from 'firebase/firestore';

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

  return (
    <div>
      <Header/>
      <button onClick={() => handleLocationSelect(1)}>1</button>
      <button onClick={() => handleLocationSelect(2)}>2</button>
    </div>
  );
}

function WaitingScreen({ setNFCData, websocket }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!websocket) {
      return;
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

  return (
  <div>
    <Header/>
    <p>Waiting for NFC...</p>
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
        navigate("/result");
      };
  
      if (nfcData && nfcData.data) {
        fetchData();
      }
    }, [nfcData, setNFCResult, navigate, location]);
  
    return (
      <div>
      <Header /> 
    <p>Loading...</p>
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
          <p>NFC Detected!</p>
          <table>
            <tbody>
              <tr>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <td key={colIndex}>
                    {colIndex + 1}
                  </td>
                ))}
              </tr>
              <tr>
                {Array.from({ length: 5 }).map((_, colIndex) => {
                    const locationNumber = colIndex + 1;
                    const locationState = nfcResult && nfcResult[locationNumber] && nfcResult[locationNumber].state;
                    return (
                      <td key={colIndex}>
                        {locationState ? "OK" : ""}
                      </td>
                    );
                  })}
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
        <Route path="/waiting" element={<WaitingScreen setNFCData={setNFCData} websocket={websocket} />} />
        <Route path="/loading" element={<LoadingScreen nfcData={nfcData} setNFCResult={setNFCResult} location={location} />} />
        <Route path="/result" element={<ResultScreen nfcResult={nfcResult} />} />
      </Routes>
    </Router>
  );
}

export default App;
