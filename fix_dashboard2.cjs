const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = "{/* Work Timer Section */}";
const endMarker = "{activeTab === 'history' && (";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers", startIndex, endIndex);
  process.exit(1);
}

// Find the beginning of the <motion.div> that wraps the Work Timer Section.
// Actually, let's just replace from `{activeTab === 'dashboard' && (` to `{activeTab === 'history' && (`
const exactStartMarker = "{activeTab === 'dashboard' && (\n          <motion.div ";
const realStartIndex = code.indexOf(exactStartMarker);

if (realStartIndex === -1) {
  console.log("Could not find real start index");
  process.exit(1);
}

const newDashboard = `{activeTab === 'dashboard' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2"
          >
            {/* Work Timer Section */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-4 p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white/5\`}>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className={\`p-1.5 rounded-lg \${state.workTimer?.isRunning ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}\`}>
                    <Clock size={16} className={state.workTimer?.isRunning ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <p className={\`\${mutedTextColor} text-[9px] uppercase font-mono tracking-widest\`}>Controle de Jornada</p>
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tighter">
                      {formatElapsedTime(elapsedTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-1.5">
                  <button 
                    onClick={resetTimer}
                    className={\`p-2 rounded-xl \${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200 border border-slate-300'} \${subMutedTextColor} transition-colors\`}
                    title="Reiniciar (Limpa sem salvar)"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button 
                    onClick={stopTimer}
                    className={\`p-2 rounded-xl \${isDark ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' : 'bg-red-50 hover:bg-red-100 text-red-600'} transition-colors\`}
                    title="Parar e Salvar"
                  >
                    <Square size={16} fill="currentColor" />
                  </button>
                  <button 
                    onClick={toggleTimer}
                    className={\`p-2.5 rounded-xl transition-all shadow-lg active:scale-95 \${state.workTimer?.isRunning ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-green-500 text-white shadow-green-500/20'}\`}
                    title={state.workTimer?.isRunning ? 'Pausar' : 'Iniciar'}
                  >
                    {state.workTimer?.isRunning ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                </div>
              </div>

              {/* Shift Selector for Timer */}
              {(!state.workTimer || !state.workTimer.isRunning) && state.settings.enableShiftTracking && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                  {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDashboardShift(s)}
                      className={\`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all \${dashboardShift === s ? 'text-white' : isDark ? 'text-white/40 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-50'}\`}
                      style={dashboardShift === s ? getStyle(state.settings.theme.headerColor, true) : undefined}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Count Goal */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4\`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={\`\${mutedTextColor} text-lg uppercase font-mono tracking-widest\`}>
                      {state.settings.enableShiftTracking ? \`Corridas - \${todayStats.currentShift}\` : 'Total de Corridas'}
                    </p>
                    {state.history.length > 0 && (
                      <button 
                        onClick={undo}
                        className={\`\${subMutedTextColor} hover:text-white transition-colors\`}
                        title="Desfazer última ação"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-5xl sm:text-7xl font-bold font-mono tracking-tight">
                    {targetCount}
                    <span className={\`\${subMutedTextColor} text-2xl sm:text-3xl\`}>
                      /{targetCountGoal}
                    </span>
                  </h2>
                  {state.settings.enableShiftTracking && (
                    <p className={\`\${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest\`}>
                      Total do dia: <span className="font-bold" style={getStyle(state.settings.theme.headerColor, true)}>{todayStats.count}</span>
                    </p>
                  )}
                </div>
                <div className={\`p-2 rounded-full \${countProgress >= 100 ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500 border border-slate-200'}\`}>
                  {countProgress >= 100 ? <CheckCircle2 size={24} className={state.settings.enableAnimation ? "animate-bounce" : ""} /> : <CheckCircle2 size={24} />}
                </div>
              </div>
              
              {countProgress >= 100 && (
                state.settings.enableAnimation ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-500/20 text-green-400 p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                  >
                    <Target size={16} />
                    Meta Atingida!
                  </motion.div>
                ) : (
                  <div className="bg-green-500/20 text-green-400 p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                    <Target size={16} />
                    Meta Atingida!
                  </div>
                )
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className={\`\${subMutedTextColor} uppercase tracking-widest text-[10px]\`}>Progresso</span>
                  <span className={\`\${countProgress >= 100 ? 'text-green-500' : ''} font-mono\`}>{countProgress.toFixed(0)}%</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: \`\${countProgress}%\`, 
                      ...getStyle(state.settings.theme.countBarColor, true)
                    }}
                  >
                    {countProgress > 0 && <WheelieBike />}
                  </div>
                </div>
              </div>
            </div>

            {/* Value Goal */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4\`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className={\`\${mutedTextColor} text-lg uppercase font-mono tracking-widest\`}>
                      {state.settings.enableShiftTracking ? \`Faturamento - \${todayStats.currentShift}\` : 'Faturamento Diário'}
                    </p>
                    {state.history.length > 0 && (
                      <button 
                        onClick={undo}
                        className={\`\${subMutedTextColor} hover:text-white transition-colors\`}
                        title="Desfazer última ação"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-5xl sm:text-7xl font-bold font-mono tracking-tight flex items-start gap-1">
                    <span className={\`\${subMutedTextColor} text-xl sm:text-2xl mt-2\`}>R$</span>
                    {targetValue.toFixed(2)}
                  </h2>
                  {state.settings.enableShiftTracking && (
                    <p className={\`\${subMutedTextColor} text-[10px] font-mono mt-1 uppercase tracking-widest\`}>
                      Total do dia: <span className="font-bold" style={getStyle(state.settings.theme.headerColor, true)}>R$ {todayStats.value.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <div className={\`p-2 rounded-full \${valueProgress >= 100 ? 'bg-green-500/20 text-green-500' : isDark ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500 border border-slate-200'}\`}>
                  {valueProgress >= 100 ? <DollarSign size={24} className={state.settings.enableAnimation ? "animate-pulse" : ""} /> : <DollarSign size={24} />}
                </div>
              </div>

              {/* Dropping Coins Overlay */}
              <div className="relative">
                <AnimatePresence>
                  {showFloatingValue && lastAddedValue && (
                    <>
                      {coinPaths.map((path, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ 
                            left: path.x[0], 
                            top: path.y[0], 
                            opacity: 0, 
                            scale: path.scale[0],
                            rotate: 0 
                          }}
                          animate={{ 
                            left: path.x, 
                            top: path.y, 
                            opacity: [0, 1, 1, 0],
                            scale: path.scale,
                            rotate: path.rotate 
                          }}
                          transition={{ 
                            duration: path.duration, 
                            delay: path.delay,
                            ease: "easeInOut"
                          }}
                          className="absolute z-20 text-yellow-500 font-extrabold font-mono flex items-center justify-center bg-yellow-300 rounded-full w-6 h-6 border-2 border-yellow-600 shadow-md"
                        >
                          $
                        </motion.div>
                      ))}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [1, 1.2, 1], y: -40 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="absolute right-0 top-[-20px] font-bold text-xl text-green-400 pointer-events-none z-50 font-mono"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
                      >
                        +R$ {lastAddedValue.toFixed(2)}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                <div className="progress-bar-container mb-2">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: \`\${valueProgress}%\`, 
                      ...getStyle(state.settings.theme.valueBarColor, true)
                    }}
                  >
                    {valueProgress > 0 && <WheelieBike />}
                  </div>
                </div>
                <div className={\`flex justify-between text-sm font-mono \${subMutedTextColor} uppercase tracking-tighter\`}>
                  <span>R$ 0</span>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <span>{valueProgress.toFixed(0)}% Concluído</span>
                      {state.history.length > 0 && (
                        <button 
                          onClick={undo}
                          className={\`underline \${isDark ? 'hover:text-white' : 'hover:text-black'} transition-colors\`}
                        >
                          Desfazer
                        </button>
                      )}
                    </div>
                    <div className="mt-1 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                      {targetValue < targetValueGoal ? (
                        <span className={\`\${isDark ? 'text-white' : 'text-slate-900'} font-bold text-xl\`}>
                          Faltam R$ {(targetValueGoal - targetValue).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-green-500 font-bold">Meta Batida! (+R$ {(targetValue - targetValueGoal).toFixed(2)})</span>
                      )}
                      <span className={\`\${isDark ? 'text-white/20' : 'text-slate-300'} hidden sm:inline\`}>•</span>
                      <div className="text-xs sm:text-sm font-sans flex items-center gap-2">
                        {targetCount < targetCountGoal ? (
                          <span className={isDark ? 'text-white/70' : 'text-slate-700 font-bold'}>
                            (Faltam <span className={\`\${isDark ? 'text-white' : 'text-slate-900'} font-bold\`}>{targetCountGoal - targetCount}</span> corridas)
                          </span>
                        ) : (
                          <span className="text-green-500/80 font-bold">(Meta de corridas batida!)</span>
                        )}
                        
                        {lastAddedValue !== null && (
                          <>
                            <span className={\`\${isDark ? 'text-white/20' : 'text-slate-300'} hidden sm:inline\`}>•</span>
                            <span className={\`text-[10px] font-bold uppercase tracking-widest \${subMutedTextColor}\`}>
                              Último: <span className="font-mono text-emerald-500 text-sm">R$ {lastAddedValue}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span>R$ {state.settings.enableShiftTracking ? todayStats.currentShiftGoal.valueGoal : currentGoal.valueGoal}</span>
                </div>

                {/* Quick Buttons for Revenue */}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  <form 
                    onSubmit={handleQuickValueSubmit}
                    className="col-span-1 flex"
                  >
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="R$"
                      value={quickValue}
                      onChange={(e) => setQuickValue(e.target.value)}
                      className={\`w-full py-3 px-2 text-lg font-mono font-bold rounded-lg border \${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500'} focus:outline-none transition-colors placeholder:text-[10px]\`}
                    />
                  </form>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <button 
                      key={val}
                      onClick={() => quickAddRide(val, \`Corrida R$ \${val}\`)}
                      className={\`py-3 px-1 rounded-lg border font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-0.5 \${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-800 shadow-sm'}\`}
                      style={getStyle(state.settings.theme.valueBarColor, true)}
                    >
                      <span className="text-[10px] opacity-65 leading-none">+R$</span>
                      <span className={\`\${getQuickAddNumberSizeClass()} leading-none\`}>{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vault Card */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 border-l-4 border-green-500 overflow-hidden relative flex flex-col justify-between\`}>
              <div className="flex justify-between items-center z-10 relative">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <p className={\`\${mutedTextColor} text-lg uppercase font-mono tracking-widest flex flex-col\`}>
                      <span className="text-xs opacity-70">Dinheiro Guardado</span>
                      <span>O Cofre</span>
                    </p>
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-bold font-mono tracking-tight flex items-start gap-1">
                    <span className={\`\${subMutedTextColor} text-xl mt-1\`}>R$</span>
                    {vaultTotal.toFixed(2)}
                  </h2>
                  <div className="flex gap-2">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const val = parseFloat(quickVaultValue);
                        if (!isNaN(val) && val > 0) {
                          addVaultValue(val);
                          setQuickVaultValue('');
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input 
                        type="number" 
                        inputMode="decimal"
                        placeholder="R$ para o cofre"
                        value={quickVaultValue}
                        onChange={(e) => setQuickVaultValue(e.target.value)}
                        className={\`w-32 py-2 px-3 text-sm font-mono font-bold rounded-lg border \${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500'} focus:outline-none transition-colors\`}
                      />
                      <button 
                        type="submit"
                        disabled={!quickVaultValue}
                        className={\`px-4 rounded-lg font-bold uppercase tracking-widest transition-all active:scale-95 \${!quickVaultValue ? 'opacity-50 cursor-not-allowed' : ''} \${isDark ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-green-100 text-green-700 hover:bg-green-200'}\`}
                      >
                        Guardar
                      </button>
                    </form>
                  </div>
                </div>

                {/* Vault Animation Container */}
                <div className={\`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 \${isDark ? 'bg-black/40 border-white/10' : 'bg-slate-200 border-slate-300'} shadow-inner flex-shrink-0\`}>
                  
                  <AnimatePresence>
                    {showVaultFloatingValue && lastVaultAddedValue && (
                      <>
                        {vaultCoinPaths.map((path, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ 
                              left: path.x[0], 
                              top: path.y[0], 
                              opacity: 0, 
                              scale: path.scale[0],
                              rotate: 0 
                            }}
                            animate={{ 
                              left: path.x, 
                              top: path.y, 
                              opacity: [0, 1, 1, 0],
                              scale: path.scale,
                              rotate: path.rotate 
                            }}
                            transition={{ 
                              duration: path.duration, 
                              delay: path.delay,
                              ease: "easeInOut"
                            }}
                            className="absolute z-20 text-yellow-500 font-extrabold font-mono flex items-center justify-center bg-yellow-300 rounded-full w-8 h-8 border-2 border-yellow-600 shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                          >
                            $
                          </motion.div>
                        ))}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 0 }}
                          animate={{ opacity: [0, 1, 1, 0], scale: [1, 1.3, 1], y: -45 }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                          className="absolute top-[20%] right-[10%] font-bold text-xl sm:text-2xl text-green-400 pointer-events-none z-50 font-mono"
                          style={{ textShadow: '0 0 15px rgba(74, 222, 128, 0.6)' }}
                        >
                          +R$ {lastVaultAddedValue.toFixed(2)}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  <div 
                    className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out bg-green-500"
                    style={{ 
                      height: \`\${vaultProgress}%\`,
                      opacity: 0.85
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {vaultMoney.map(money => (
                        <div
                          key={money.id}
                          className="absolute text-green-100 font-bold font-mono drop-shadow-md"
                          style={{
                            left: \`\${money.left}%\`,
                            fontSize: \`\${money.size}px\`,
                            animation: \`float-bubble \${money.duration}s infinite linear, bubble-sway \${money.swayDuration}s infinite ease-in-out\`,
                            animationDelay: \`\${money.delay}s\`,
                          }}
                        >
                          $
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay opacity-30">
                    <Vault size={60} />
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Breakdown */}
            <div className="col-span-2 lg:col-span-2 grid grid-cols-3 gap-2 sm:gap-3">
              {(['manhã', 'tarde', 'noite'] as const).map((s) => (
                <div key={s} className={\`\${cardClass} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1\`}>
                  <p className={\`\${subMutedTextColor} text-[8px] sm:text-[10px] uppercase font-mono tracking-tighter\`}>{s}</p>
                  <p className="text-lg sm:text-xl font-bold font-mono">{todayStats.shifts[s].count}</p>
                  <p className={\`\${mutedTextColor} text-[8px] sm:text-[10px] font-mono\`}>R$ {todayStats.shifts[s].value.toFixed(0)}</p>
                </div>
              ))}
            </div>

            {/* Recent Rides */}
            <div className="col-span-2 lg:col-span-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={\`text-sm font-bold uppercase tracking-widest \${mutedTextColor}\`}>Corridas de Hoje</h3>
                {!state.finalizedDays?.includes(today) && (
                  <div className="flex items-center gap-2">
                    <form onSubmit={handleQuickValueSubmit} className="flex items-center gap-1">
                      <input 
                        type="number" 
                        inputMode="decimal"
                        placeholder="R$ Rápido"
                        value={quickValue}
                        onChange={(e) => setQuickValue(e.target.value)}
                        className={\`w-24 h-8 px-2 text-xs font-mono font-bold rounded-lg border \${isDark ? 'bg-white/5 border-white/10 text-white focus:border-white/30' : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-slate-500'} focus:outline-none transition-colors\`}
                      />
                      <button 
                        type="submit"
                        className={\`p-1.5 rounded-lg transition-colors border \${isDark ? 'bg-white/10 hover:bg-white/20 border-white/5' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'}\`}
                        title="Adicionar rápido"
                      >
                        <Plus size={16} />
                      </button>
                    </form>
                    <div className={\`w-px h-4 mx-1 \${isDark ? 'bg-white/10' : 'bg-slate-350'}\`} />
                    {state.history.length > 0 && (
                      <button 
                        onClick={undo}
                        className={\`flex items-center gap-1 text-xs font-bold uppercase tracking-tighter \${subMutedTextColor} \${isDark ? 'hover:text-white' : 'hover:text-slate-900'} transition-colors\`}
                        title="Desfazer última ação"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setNewRideShift(registrationShift);
                        setIsAddingRide(true);
                      }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={getStyle(state.settings.theme.headerColor)}
                      title="Adicionar detalhado"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {todayRides.filter(r => !state.settings.enableShiftTracking || dashboardShift === 'dia' || r.shift === dashboardShift).length === 0 ? (
                  <div className={\`\${cardClass} p-8 text-center border-dashed border-2 \${isDark ? 'border-white/5' : 'border-slate-300'}\`}>
                    <p className={\`\${subMutedTextColor} text-sm italic\`}>Nenhuma corrida registrada {dashboardShift !== 'dia' ? \`no turno \${dashboardShift}\` : 'hoje'}.</p>
                  </div>
                ) : (
                  todayRides.filter(r => !state.settings.enableShiftTracking || dashboardShift === 'dia' || r.shift === dashboardShift).map(ride => (
                    <motion.div 
                      key={ride.id}
                      layout={state.settings.enableAnimation}
                      initial={state.settings.enableAnimation ? { opacity: 0, x: -20 } : false}
                      animate={state.settings.enableAnimation ? { opacity: 1, x: 0 } : false}
                      className={\`\${cardClass} p-4 flex justify-between items-center\`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${isDark ? 'bg-white/5' : 'bg-slate-100'}\`}>
                          <Bike size={20} className={mutedTextColor} />
                        </div>
                        <div>
                          <p className="font-bold text-lg font-mono">R$ {ride.value.toFixed(2)}</p>
                          <div className="flex items-center gap-2">
                            <p className={\`\${subMutedTextColor} text-xs uppercase tracking-widest\`}>
                              {new Date(ride.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {state.settings.enableShiftTracking && (
                              <span className={\`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest font-bold \${isDark ? 'bg-white/10 border-white/20 text-white/70' : 'bg-slate-200 border-slate-300 text-slate-700'}\`}>
                                {ride.shift}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {ride.note && (
                          <span className={\`text-[10px] px-2 py-1 rounded-full \${isDark ? 'bg-white/5' : 'bg-slate-100'} \${subMutedTextColor} uppercase tracking-tighter truncate max-w-[100px] sm:max-w-[150px]\`}>
                            {ride.note}
                          </span>
                        )}
                        <button 
                          onClick={() => {
                            if (confirm('Excluir esta corrida?')) {
                              deleteRide(ride.id);
                            }
                          }}
                          className={\`p-2 rounded-lg \${isDark ? 'hover:bg-red-500/20 text-red-500/50 hover:text-red-500' : 'hover:bg-red-50 text-red-400 hover:text-red-600'} transition-colors\`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            <div className="pb-10"></div>
          </motion.div>
        )}
        `;

code = code.substring(0, realStartIndex) + newDashboard + "        {activeTab === 'history' && (";
fs.writeFileSync('src/App.tsx', code);
console.log('Successfully wrote pristine dashboard layout');
