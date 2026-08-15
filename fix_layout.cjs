const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The layout 1 (Bento Grid) had a very specific structure. We will find where dashboard starts and ends.
const dashboardStartMarker = "{activeTab === 'dashboard' && (\\s*<motion\\.div\\s*\\{\\.\\.\\.motionProps\\(\\{ opacity: 0, y: 20 \\}, \\{ opacity: 1, y: 0 \\}\\)\\}\\s*className=\"space-y-6 pt-2\"\\s*>)";
const dashboardEndMarker = "\\s*<\\/motion\\.div>\\s*\\)\\}\\s*\\{\\/\\* History Tab \\*\\/\\}";

const startRegex = new RegExp(dashboardStartMarker, "m");
const endRegex = new RegExp(dashboardEndMarker, "m");

const startMatch = code.match(startRegex);
const endMatch = code.match(endRegex);

if (startMatch && endMatch) {
  const startIndex = startMatch.index + startMatch[0].length;
  const endIndex = endMatch.index;

  // Let's verify we matched correctly
  console.log("Found start and end");
} else {
  console.log("Could not find boundaries");
}
