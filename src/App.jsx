import './App.css'
import React, { useState, useEffect } from 'react';
import Websocket from 'react-websocket';
import { initializeApp} from 'firebase/app';
import { doc, setDoc, getDoc, serverTimestamp,getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // apiKey: import.meta.env.VITE_API_KEY,
  // authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  // projectId: import.meta.env.VITE_PROJECT_ID,
  // storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  // messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  // appId: import.meta.env.VITE_APP_ID,
  apiKey: "AIzaSyC3CjfPL2JCGKIO3WCvEnnPmYT8YBm7faE",
  authDomain: "setafesic2023.firebaseapp.com",
  projectId: "setafesic2023",
  storageBucket: "setafesic2023.appspot.com",
  messagingSenderId:"716883567683",
  appId: "1:716883567683:web:c6a2dc8584a37cb8cfe0f6"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

// Create（新しいドキュメントを作成）
const createDocument = async (id, location) => {
  const docRef = doc(db, 'nfcIDs', id);
  await setDoc(docRef, {
    [location]: {
      timestamp: serverTimestamp(),
      status: true
    }
  });
};

// Read（ドキュメントを取得）
const readDocument = async (id) => {
  const docRef = doc(db, 'nfcIDs', id);
  const docSnap = await getDoc(docRef); 
  if (!docSnap.exists()) {
    console.log(`ドキュメント ${id} は存在しません。`);
    return null;
  }
  return docSnap.data();
};

// Update（ドキュメントを更新）
const updateDocument = async (id, location) => {
  const docRef = doc(db, 'nfcIDs', id);
  await setDoc(docRef, {
    [location]: {
      timestamp: serverTimestamp(),
      status: true
    }
  }, { merge: true }); //既存のデータをマージ
};

// Delete（ドキュメントを削除）
const deleteDocument = (id) => {
  return db.collection('nfcIDs').doc(id).delete();
};


function App() {
  const [screen, setScreen] = useState('settings');  // 初期画面は設定画面
  const [location, setLocation] = useState(null);  // 設定された場所を保存
  const [nfcId, setNfcId] = useState(null);
  const [ws, setWs] = useState(null);
  const reconnectInterval = 2000; // 再接続までの待ち時間 (2秒)

  useEffect(() => {
    console.log(`画面遷移: ${screen}`);
  
    const websocket = new WebSocket('ws://localhost');

    websocket.onopen = () => {
      console.log('WebSocket opened.');
    };

    websocket.onmessage = (event) => {
      handleData(event.data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket closed. Trying to reconnect...');
      setTimeout(() => {
        setWs(new WebSocket('ws://localhost'));
      }, reconnectInterval);
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
}, [screen, ws]);

  const handleData = async (data) => {
    const result = JSON.parse(data);
    setNfcId(result.id);
    setScreen('loading');

     // Firestoreでドキュメントが存在するかチェック
     const existingDoc = await readDocument(result.id);
    
     if (!existingDoc) {
       // ドキュメントが存在しない場合、新規作成
       await createDocument(result.id, location);
     } else {
       // ドキュメントが存在する場合、更新
       await updateDocument(result.id, location);
     }

    // setTimeout(() => {
    //   setScreen('results');  // ここでは、デモのために読み込み後に結果画面に自動的に遷移します。
    // }, 2000);  // 2秒後に結果画面に遷移
  };

  return (
    <div>
      {screen === 'settings' && <SettingsScreen setLocation={setLocation} setScreen={setScreen} />}
      {screen === 'waiting' && <WaitingScreen handleData={handleData} location={location}/>}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'results' && <ResultsScreen nfcId={nfcId} setScreen={setScreen} />}
    </div>
  );
}

function SettingsScreen({ setLocation, setScreen }) {
  const handleLocationClick = (chosenLocation) => {
    console.log(`場所設定: ${chosenLocation}`);
    setLocation(chosenLocation);
    setScreen('waiting');
  };
  return (
    <div>
      <h1>設定画面</h1>
      <button onClick={() => handleLocationClick('1')}> <div> 1 </div> 1号館 </button>
      <button onClick={() => handleLocationClick('2')}> <div> 2 </div> 7号館 B教室</button>
      <button onClick={() => handleLocationClick('3')}> <div> 3 </div> 6号館 </button>
      <button onClick={() => handleLocationClick('4')}> <div> 4 </div> 7号館 1</button>
      <button onClick={() => handleLocationClick('5')}> <div> 5 </div> 9号館 </button>
      <button onClick={() => handleLocationClick('Result')}> <div> Result </div> 1号館 2F </button>

    </div>
  );
}

function WaitingScreen({ handleData, location  }) {
  // useEffect(() => {
  //   // ダミーデータのシミュレーション
  //   const simulateWebsocketData = () => {
  //     const dummyData = {
  //       id: 'dummyID12345',
  //     };
  //     handleData(JSON.stringify(dummyData));
  //   };

  //   // 5秒後にダミーデータを送信する
  //   const timeoutId = setTimeout(simulateWebsocketData, 1000);

  //   // コンポーネントのクリーンアップ時にタイムアウトをクリアする
  //   return () => {
  //     clearTimeout(timeoutId);
  //   };
  // }, [handleData]);
  return (
    <div>
      <h1>{location}での待機画面</h1>
    </div>
  );
}

function LoadingScreen() {
  return <h1>読み込み中...</h1>;
}

function ResultsScreen({ nfcId , setScreen}) {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      if (nfcId) {
        const docRef = doc(db, 'nfcIDs', nfcId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLocations(docSnap.data());
        }
      }
    };
    fetchResults();
  }, [nfcId]);

  useEffect(() => {
    // 例: 10秒後に待機画面に戻る
    const timer = setTimeout(() => {
      setScreen('waiting');
    }, 1000);

    // コンポーネントのアンマウント時にタイマーをクリアする
    return () => clearTimeout(timer);
  }, [setScreen]);

  return (
    <div>
      <h1>結果確認画面</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {["1", "2", "3", "4", "5"].map((location) => (
            <tr key={location}>
              <td>{location}</td>
              <td>{locations[location]?.status ? "True" : "False"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;