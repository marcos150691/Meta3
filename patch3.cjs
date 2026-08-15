const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Wrapper
code = code.replace(
  /className="flex flex-col gap-8 pt-6 max-w-2xl mx-auto"/g,
  'className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 max-w-7xl mx-auto"'
);

// 2. Timer
code = code.replace(
  /className=\{`\$\{cardClass\} w-full p-6 sm:p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden ring-2 ring-white\/10 rounded-\[2rem\] shadow-2xl scale-105`\}/g,
  'className={`\\${cardClass} md:col-span-12 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden ring-1 ring-white/10 rounded-xl shadow-md`}'
);
code = code.replace(
  /className="w-full flex justify-between items-center relative z-10"/g,
  'className="w-full flex sm:flex-row flex-col justify-between items-center relative z-10 gap-4"'
);

// 3. Count & Value Goals
code = code.replace(
  /className=\{`\$\{cardClass\} w-full p-6 sm:p-8 space-y-6 rounded-\[2rem\] shadow-xl`\}/g,
  'className={`\\${cardClass} md:col-span-4 p-4 sm:p-5 space-y-4 rounded-xl shadow-sm border border-white/10`}'
);

// 4. Vault
code = code.replace(
  /className=\{`\$\{cardClass\} w-full p-6 sm:p-8 border-l-8 border-green-500 overflow-hidden relative flex flex-col justify-between rounded-\[2rem\] shadow-xl`\}/g,
  'className={`\\${cardClass} md:col-span-4 p-4 sm:p-5 border-t-4 border-l-0 border-green-500 overflow-hidden relative flex flex-col justify-between rounded-xl shadow-sm border-x border-b border-white/10`}'
);

// 5. Shift Breakdown
code = code.replace(
  /className="w-full grid grid-cols-3 gap-3 sm:gap-4"/g,
  'className="md:col-span-12 grid grid-cols-3 gap-2 sm:gap-4"'
);
code = code.replace(
  /className=\{`\$\{cardClass\} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1`\}/g,
  'className={`\\${cardClass} p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1 rounded-xl shadow-sm border border-white/5`}'
);

// 6. Action Buttons
code = code.replace(
  /className="w-full grid grid-cols-1 gap-4 my-4"/g,
  'className="md:col-span-12 grid grid-cols-2 gap-4 my-2"'
);
code = code.replace(
  /className=\{`p-4 sm:p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg \$\{isDark \? 'bg-green-500 text-black hover:bg-green-400' : 'bg-green-600 text-white hover:bg-green-500'\}`\}/g,
  'className={`p-3 sm:p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${isDark ? \'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30\' : \'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100\'}`}'
);
code = code.replace(
  /className=\{`p-4 sm:p-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 shadow-lg \$\{isDark \? 'bg-red-500 text-black hover:bg-red-400' : 'bg-red-600 text-white hover:bg-red-500'\}`\}/g,
  'className={`p-3 sm:p-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${isDark ? \'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30\' : \'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100\'}`}'
);

// fix icon sizes
code = code.replace(
  /<Plus size=\{32\} \/>/g,
  '<Plus size={20} />'
);
code = code.replace(
  /<Minus size=\{32\} \/>/g,
  '<Minus size={20} />'
);

// fix text sizes
code = code.replace(
  /<span className="font-bold uppercase tracking-widest text-base sm:text-lg">Nova Corrida<\/span>/g,
  '<span className="font-bold uppercase tracking-widest text-sm">Nova Corrida</span>'
);
code = code.replace(
  /<span className="font-bold uppercase tracking-widest text-base sm:text-lg">Nova Despesa<\/span>/g,
  '<span className="font-bold uppercase tracking-widest text-sm">Nova Despesa</span>'
);

// 7. Recent Rides
code = code.replace(
  /className="w-full space-y-6 pt-4"/g,
  'className="md:col-span-12 space-y-4 pt-4 border-t border-white/10"'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched for Layout 3');
