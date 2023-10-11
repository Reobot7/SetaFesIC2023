import './App.css'
import React, { useState, useEffect } from 'react';
import Websocket from 'react-websocket';
import { initializeApp} from 'firebase/app';
import { doc, setDoc, getDoc, serverTimestamp,getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
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

  useEffect(() => {
    console.log(`画面遷移: ${screen}`);
  }, [screen]);

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

    setTimeout(() => {
      setScreen('results');  // ここでは、デモのために読み込み後に結果画面に自動的に遷移します。
    }, 2000);  // 2秒後に結果画面に遷移
  };

  return (
    <div>
      {screen === 'settings' && <SettingsScreen setLocation={setLocation} setScreen={setScreen} />}
      {screen === 'waiting' && <WaitingScreen handleData={handleData} location={location}/>}
      {screen === 'loading' && <LoadingScreen />}
      {screen === 'results' && <ResultsScreen id={nfcId} />}
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
  useEffect(() => {
    // ダミーデータのシミュレーション
    const simulateWebsocketData = () => {
      const dummyData = {
        id: 'dummyID12345',
      };
      handleData(JSON.stringify(dummyData));
    };

    // 5秒後にダミーデータを送信する
    const timeoutId = setTimeout(simulateWebsocketData, 1000);

    // コンポーネントのクリーンアップ時にタイムアウトをクリアする
    return () => {
      clearTimeout(timeoutId);
    };
  }, [handleData]);
  return (
    <div>
      <h1>{location}での待機画面</h1>
      {/* <Websocket url='ws://localhost' onMessage={handleData} /> */}
    </div>
  );
}

function LoadingScreen() {
  return <h1>読み込み中...</h1>;
}

function ResultsScreen({ id }) {
  // Firestoreからのデータ取得と表示ロジックを追加
  const fetchedData = [
    { id: '12345', location: '場所1', timestamp: 1633759337 },
  ];

  useEffect(() => {
    fetchedData.forEach(data => {
      console.log(`ID読み込み: ${data.id}, 場所: ${data.location}, タイムスタンプ: ${data.timestamp}`);
    });
  }, [fetchedData]);

  return (
    <div>
      <h1>結果画面</h1>
      <p>ID: {id}</p>
    </div>
  );
}

export default App;