const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Change 1: Grid structure
code = code.replace(
  /\{activeTab === 'dashboard' && \(\s*<motion\.div\s*\{\.\.\.motionProps\(\{ opacity: 0, y: 20 \}, \{ opacity: 1, y: 0 \}\)\}\s*className="space-y-6 pt-2"\s*>\s*\{\/\* Work Timer Section \*\/\}\s*<div className={`\$\{cardClass\} p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white\/5`}>/,
  `{activeTab === 'dashboard' && (
          <motion.div 
            {...motionProps({ opacity: 0, y: 20 }, { opacity: 1, y: 0 })}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2"
          >
            {/* Work Timer Section */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-4 p-3 sm:p-4 flex flex-col gap-2 relative overflow-hidden ring-1 ring-white/5\`}>`
);

// Change 2: Progress cards wrapper
code = code.replace(
  /\{\/\* Progress Cards \*\/\}\s*<div className="grid grid-cols-1 gap-4">\s*\{\/\* Count Goal \*\/\}\s*<div className={`\$\{cardClass\} p-4 sm:p-6 space-y-4`}>/,
  `{/* Progress Cards */}
            {/* Count Goal */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4\`}>`
);

// Change 3: Value goal
code = code.replace(
  /\{\/\* Value Goal \*\/\}\s*<div className={`\$\{cardClass\} p-4 sm:p-6 space-y-4`}>/,
  `{/* Value Goal */}
              <div className={\`\${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 space-y-4\`}>`
);

// Change 4: Remove extra div closing
code = code.replace(
  /                  <\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Vault Card \*\/\}\s*<div className={`\$\{cardClass\} p-4 sm:p-6 border-l-4 border-green-500 overflow-hidden relative`}>/,
  `                  </div>
                </div>
              </div>

            {/* Vault Card */}
            <div className={\`\${cardClass} col-span-2 lg:col-span-2 p-4 sm:p-6 border-l-4 border-green-500 overflow-hidden relative flex flex-col justify-between\`}>`
);

// Change 5: Shift breakdown
code = code.replace(
  /            <\/div>\s*\{\/\* Shift Breakdown \*\/\}\s*<div className="grid grid-cols-3 gap-2 sm:gap-3">/,
  `            </div>

            {/* Shift Breakdown */}
            <div className="col-span-2 lg:col-span-2 grid grid-cols-3 gap-2 sm:gap-3">`
);

// Change 6: Big action button + Recent rides
code = code.replace(
  /            <\/div>\s*\{\/\* Recent Rides \*\/\}\s*<div className="space-y-4">/,
  `            </div>

            {/* Big Action Button (Bento) */}
            <div className="col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-2">
              <button 
                onClick={() => {
                  setNewRideShift(registrationShift);
                  setIsAddingRide(true);
                }}
                className={\`p-4 sm:p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg \${isDark ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-green-600 text-white hover:bg-green-500'}\`}
              >
                <Plus size={32} />
                <span className="font-bold uppercase tracking-widest text-base sm:text-lg">Nova Corrida</span>
              </button>
              
              <button 
                onClick={() => {
                  setNewActivityType('despesa');
                  setIsAddingActivity(true);
                }}
                className={\`p-4 sm:p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg \${isDark ? 'bg-red-500 text-black hover:bg-red-400' : 'bg-red-600 text-white hover:bg-red-500'}\`}
              >
                <Minus size={32} />
                <span className="font-bold uppercase tracking-widest text-base sm:text-lg">Nova Despesa</span>
              </button>
            </div>

            {/* Recent Rides */}
            <div className="col-span-2 lg:col-span-4 space-y-4">`
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched');
