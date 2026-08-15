const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Fix addRide calls
code = code.replace(/addRide\(val, newRideDesc, newRideDate, newRideShift\);/g, 'addRide();');

// Fix addActivity calls
code = code.replace(/addActivity\('despesa', 'Outro', val, newActivityDesc, newActivityDate, newActivityShift\);/g, 'addActivity();');

// Fix vaultTotal
code = code.replace(/\{vaultTotal\.toFixed\(2\)\}/g, '{(state.vaultState?.currentValue || 0).toFixed(2)}');

// Fix addVaultValue
code = code.replace(/addVaultValue\(val\);/g, 'addToVault(val);');

// Add missing state for quickVaultValue
const stateInjectStr = "  const [elapsedTime, setElapsedTime] = useState(0);";
code = code.replace(stateInjectStr, stateInjectStr + "\n  const [quickVaultValue, setQuickVaultValue] = useState('');");

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed linting issues');
