const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = "                {activeTab === 'history' && (";
const truncateIdx = code.indexOf(targetStr);

if (truncateIdx === -1) {
  console.log("Could not find the truncation point.");
  process.exit(1);
}

code = code.substring(0, truncateIdx);

const recovery = `
        {activeTab !== 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 mt-10"
          >
            <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4">
              <Bike className={mutedTextColor} size={48} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-widest text-center font-mono">
              Em Construção
            </h2>
            <p className="text-center opacity-70 text-sm max-w-xs">
              Esta aba está sendo reconstruída devido a uma atualização no sistema. Por favor, utilize o painel principal.
            </p>
          </motion.div>
        )}

        {/* Navigation Bar */}
        <div className={\`fixed bottom-0 left-0 right-0 p-2 sm:p-4 z-40\`}>
          <div className={\`\${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-slate-200'} backdrop-blur-xl border rounded-3xl flex justify-around items-center p-2 shadow-2xl\`}>
            {[
              { id: 'dashboard', icon: Bike, label: 'Painel' },
              { id: 'history', icon: History, label: 'Histórico' },
              { id: 'finance', icon: Wallet, label: 'Finanças' },
              { id: 'productivity', icon: TrendingUp, label: 'Resumo' },
              { id: 'settings', icon: Settings, label: 'Config' }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={\`flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all \${isActive ? (isDark ? 'bg-white/10' : 'bg-slate-100') : 'hover:bg-black/5'}\`}
                  style={isActive ? getStyle(state.settings.theme.headerColor) : undefined}
                >
                  <tab.icon size={24} className={isActive ? 'text-white' : subMutedTextColor} />
                  <span className={\`text-[9px] uppercase tracking-tighter mt-1 font-bold \${isActive ? 'text-white' : subMutedTextColor}\`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isAddingRide && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className={\`w-full max-w-md \${cardClass} p-6 space-y-4 shadow-2xl\`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-mono uppercase tracking-widest">Nova Corrida</h2>
                  <button onClick={() => setIsAddingRide(false)} className={\`p-2 rounded-full \${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}\`}>
                    ✕
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseFloat(newRideValue.replace(',', '.'));
                  if (!isNaN(val) && val > 0) {
                    addRide(val, newRideDesc, newRideDate, newRideShift);
                    setIsAddingRide(false);
                    setNewRideValue('');
                    setNewRideDesc('');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Valor (R$)</label>
                    <input 
                      type="number" step="0.01" required autoFocus
                      value={newRideValue} onChange={e => setNewRideValue(e.target.value)}
                      className={\`w-full p-4 rounded-xl border font-mono text-2xl \${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-white/50\`}
                      placeholder="0.00"
                    />
                  </div>
                  {state.settings.enableShiftTracking && (
                    <div>
                      <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Turno</label>
                      <div className="flex gap-2">
                        {(['manhã', 'tarde', 'noite'] as const).map(s => (
                          <button
                            key={s} type="button" onClick={() => setNewRideShift(s)}
                            className={\`flex-1 py-3 text-xs uppercase tracking-widest rounded-xl border transition-all \${newRideShift === s ? 'border-transparent text-white' : isDark ? 'border-white/20 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50'}\`}
                            style={newRideShift === s ? getStyle(state.settings.theme.headerColor, true) : undefined}
                          >{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Nota (Opcional)</label>
                    <input 
                      type="text" 
                      value={newRideDesc} onChange={e => setNewRideDesc(e.target.value)}
                      className={\`w-full p-4 rounded-xl border font-mono \${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none\`}
                      placeholder="Ex: Uber, 99, Particular..."
                    />
                  </div>
                  <button type="submit" className="w-full p-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all active:scale-95 text-lg" style={getStyle(state.settings.theme.headerColor, true)}>
                    Salvar
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}

          {isAddingActivity && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            >
              <motion.div 
                initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                className={\`w-full max-w-md \${cardClass} p-6 space-y-4 shadow-2xl\`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold font-mono uppercase tracking-widest text-red-500">Nova Despesa</h2>
                  <button onClick={() => setIsAddingActivity(false)} className={\`p-2 rounded-full \${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}\`}>
                    ✕
                  </button>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseFloat(newActivityValue.replace(',', '.'));
                  if (!isNaN(val) && val > 0) {
                    addActivity('despesa', 'Outro', val, newActivityDesc, newActivityDate, newActivityShift);
                    setIsAddingActivity(false);
                    setNewActivityValue('');
                    setNewActivityDesc('');
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Valor (R$)</label>
                    <input 
                      type="number" step="0.01" required autoFocus
                      value={newActivityValue} onChange={e => setNewActivityValue(e.target.value)}
                      className={\`w-full p-4 rounded-xl border font-mono text-2xl \${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-red-500/50\`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest opacity-70 block mb-1">Descrição</label>
                    <input 
                      type="text" required
                      value={newActivityDesc} onChange={e => setNewActivityDesc(e.target.value)}
                      className={\`w-full p-4 rounded-xl border font-mono \${isDark ? 'bg-black/40 border-white/20 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} focus:outline-none focus:border-red-500/50\`}
                      placeholder="Ex: Gasolina, Lanche, Manutenção..."
                    />
                  </div>
                  <button type="submit" className="w-full p-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all active:scale-95 bg-red-600 hover:bg-red-500 text-lg shadow-lg shadow-red-500/20">
                    Registrar Despesa
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
`;

code = code + recovery;
fs.writeFileSync('src/App.tsx', code);
console.log('Recovered!');
