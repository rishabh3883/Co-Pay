const fs = require('fs');

if (!fs.existsSync('src/controllers')) fs.mkdirSync('src/controllers');
if (!fs.existsSync('src/models')) fs.mkdirSync('src/models');
if (!fs.existsSync('src/views')) fs.mkdirSync('src/views');

const appLines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');

const appStart = appLines.findIndex(l => l.includes('export default function App() {'));
let appStateEnd = -1;

for (let i = appStart; i < appLines.length; i++) {
  if (appLines[i].includes('const appState = {')) {
    for (let j = i; j < appLines.length; j++) {
      if (appLines[j].includes('};')) {
        appStateEnd = j;
        break;
      }
    }
    break;
  }
}

const importsAndGlobals = appLines.slice(0, appStart).join('\n');
const controllerImports = importsAndGlobals
  .split('\n')
  .filter(l => !l.includes('./components/') && !l.includes('lucide-react'))
  .join('\n');

const logicBlock = appLines.slice(appStart + 1, appStateEnd + 1).join('\n');

const controllerContent = `${controllerImports}
export default function useAppController() {
${logicBlock}
  return appState;
}
`;
fs.writeFileSync('src/controllers/useAppController.js', controllerContent);

const viewImports = importsAndGlobals
  .split('\n')
  .map(l => l.replace('./components/', '../components/'))
  .join('\n');

const uiBlock = appLines.slice(appStateEnd + 1).join('\n');

const appViewContent = `${viewImports.replace(/import React, /, `import React, `)}
import { Sparkles, ShieldAlert } from 'lucide-react';
import useAppController from '../controllers/useAppController';

export default function AppView() {
  const appState = useAppController();
  const { theme, toggleTheme, canvasRef, token, setToken, user, setUser, isBackendConnected, setIsBackendConnected, activeTab, setActiveTab, activeHomeId, setActiveHomeId, homes, setHomes, isListening, voiceDraft, setVoiceDraft, handleStartVoiceRecognition, handleCommitVoiceDraft, voiceError, setVoiceError, selectedSettlementPayee, setSelectedSettlementPayee, settlementRefId, setSettlementRefId, handleSubmitSettlementPayment, isSubmittingPayment, activeHome, setMembers, balances, settlements, addTransaction, deleteTransaction, loading, error, categoryColors, calculationsData } = appState;

${uiBlock}
`;
fs.writeFileSync('src/views/AppView.jsx', appViewContent);

fs.writeFileSync('src/App.jsx', "import AppView from './views/AppView';\n\nexport default function App() {\n  return <AppView />;\n}\n");

const modelContent = `export default class AppModel {
  static getLocalData(key, fallback = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  }
  static saveLocalData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}`;
fs.writeFileSync('src/models/AppModel.js', modelContent);

console.log('MVC Refactor Complete');
