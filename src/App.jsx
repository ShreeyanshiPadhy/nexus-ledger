import { useState } from 'react';
import MultiTabForm from './components/MultiTabForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import {Provider} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {store, persistor} from './store/store.js';
import { loadExistingRecord, resetForm } from './store/formSlice.js';
import './styles.css'

function App() {  
  const [currentView, setCurrentView] = useState("Dashboard");

  const handleEditLog = (logItem) => {
    setCurrentView("Form");
  }

  return (
    <Provider store={store}>
    <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
    <div className="App">
      {currentView=== "Dashboard" ? <Dashboard LogNewEntry={()=> {
        setCurrentView("Form")}}
        onSelectEditEntry={handleEditLog}/> 
      : <MultiTabForm BackToDash={()=>setCurrentView("Dashboard")}/>}
    </div>
    </PersistGate>
    </Provider>
  )
}

export default App