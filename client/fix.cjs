const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const appFile = path.join(srcDir, 'App.jsx');
let content = fs.readFileSync(appFile, 'utf8');

const tabs = [
  { name: 'PersonalTab', key: 'personal' },
  { name: 'SharedTab', key: 'shared' },
  { name: 'BalancesTab', key: 'balances' },
  { name: 'CalendarTab', key: 'calendar' },
  { name: 'CalculationsTab', key: 'calculations' },
  { name: 'ProfileTab', key: 'profile' }
];

for (let i = 0; i < tabs.length; i++) {
  const currentTab = tabs[i];
  const nextTab = i < tabs.length - 1 ? tabs[i+1] : null;

  const startMarker = `{activeTab === '${currentTab.key}' && (`;
  const nextMarker = nextTab ? `{ <${nextTab.name}` : `</main>`; 

  const startIdx = content.indexOf(startMarker);
  const nextIdx = content.indexOf(nextMarker, startIdx);

  if (startIdx !== -1 && nextIdx !== -1) {
    let block = content.substring(startIdx, nextIdx);
    // Find the last `)}` in this block
    const lastParenIdx = block.lastIndexOf(')}');
    if (lastParenIdx !== -1) {
       // Extract the actual JSX inside
       let jsx = block.substring(startMarker.length, lastParenIdx).trim();
       
       // write to component file
       const compFile = path.join(srcDir, 'components', `${currentTab.name}.jsx`);
       if (fs.existsSync(compFile)) {
         let fileCode = fs.readFileSync(compFile, 'utf8');
         // Replace the empty return with the JSX
         fileCode = fileCode.replace(/return \(\s*\);/, `return (\n    ${jsx}\n  );`);
         // Add fragments if the JSX is multiple adjacent tags (though it should be a single div mostly)
         if (jsx.startsWith('<') && !fileCode.includes('<>')) {
           fileCode = fileCode.replace(`return (\n    ${jsx}\n  );`, `return (\n    <>\n      ${jsx}\n    </>\n  );`);
         }
         fs.writeFileSync(compFile, fileCode);
       }

       // Remove the massive chunk from App.jsx!
       content = content.substring(0, startIdx) + content.substring(nextIdx);
    } else {
        console.log("Could not find closing parenthesis for", currentTab.name);
    }
  } else {
      console.log("Could not find bounds for", currentTab.name, "startIdx:", startIdx, "nextIdx:", nextIdx);
  }
}
fs.writeFileSync(appFile, content);
console.log("Tabs exported and removed from App.jsx successfully!");
