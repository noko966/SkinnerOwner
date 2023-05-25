const { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, 
    QFileDialog, QIcon, QLineEdit, FileMode } = require('@nodegui/nodegui');
const logo = require('../assets/logox200.png');
const fs = require("fs");
const path = require("path");
const fsExtra = require('fs-extra');
const win = new QMainWindow();
win.setWindowTitle("Skinner Owner");

const centralWidget = new QWidget();
centralWidget.setObjectName("SO_root");

const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);
const filesPathStarter = path.join(__dirname, '../',  "files/starter");

let State = {
    workingFiles: fs.readdirSync(filesPathStarter),
    variableA: "--bodyBorder",
    variableB: "--bodyBg3",
}


const outputPath = path.join(__dirname, "../", "output");


const label = new QLabel();
label.setObjectName("SO_label");
label.setText("Welcome");

const parameterAInput = new QLineEdit();
parameterAInput.setPlaceholderText('Enter text...');
parameterAInput.setObjectName('SO_input');

const parameterBInput = new QLineEdit();
parameterBInput.setPlaceholderText('Enter text...');
parameterBInput.setObjectName('SO_input');

const buttonBrowseWorkingFiles = new QPushButton();
buttonBrowseWorkingFiles.setText("Select Files");
buttonBrowseWorkingFiles.addEventListener('clicked', selectWorkingFiles);

const buttonReplaceEssenceAwithB = new QPushButton();
buttonReplaceEssenceAwithB.setText("replace essence A with essence B");
buttonReplaceEssenceAwithB.addEventListener('clicked', () => {replaceVariables(State.variableA, State.variableB)});

parameterAInput.addEventListener('textEdited', ()=>{
    const inputValue = parameterAInput.text();
    updateState("variableA", inputValue);
})

parameterBInput.addEventListener('textEdited', ()=>{
    const inputValue = parameterBInput.text();
    updateState("variableB", inputValue);
})





function updateState(key, val){
    State[key] = val;
    console.log(State);
    return State;
}

rootLayout.addWidget(buttonBrowseWorkingFiles);

rootLayout.addWidget(label);
rootLayout.addWidget(parameterAInput);
rootLayout.addWidget(parameterBInput);
rootLayout.addWidget(buttonReplaceEssenceAwithB);

win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #SO_root {
      background-color: #4d4d4d;
      color: #fff;
      width: 1000px;
      height: '100%';
      align-items: 'center';
      justify-content: 'center';
    }
    #SO_label {
      font-size: 16px;
      font-weight: bold;
      padding: 1;
      color: #fff;
    }
    #SO_input{
        background-color: #333;
      color: #ccc;
      width: 300px;
      height: 50px;
      border-radius: 6px;
      border:0;
    }
  `
);





function clearDirectory(dir) {
    fsExtra.emptyDirSync(dir);
}

function generateTodaysDate(){
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    });

return formattedDate
}


function replaceVariables(a, b) {
        const StateStarterPaths = State.workingFiles;
    clearDirectory(outputPath);
    const quote = `  /* ---Modified On ${generateTodaysDate()} by Nik--- */  `
  const encoding = "utf8";
  const variableNameA = a;
  const regexPatternA = new RegExp(
    `\\${variableNameA}\\:\\s*([^;]+)`
  );
  const variableNameB = b;
  const regexPatternB = new RegExp(`\\${variableNameB}\\:\\s*([^;]+)`);
  for (let i = 0; i < StateStarterPaths.length; i++) {
    console.log(StateStarterPaths[i], "aaaa");
    const fileContent = fs.readFileSync(
      path.join(filesPathStarter, "/", StateStarterPaths[i]),
      encoding
    );

    const matchA = regexPatternA.exec(fileContent);
    const matchB = regexPatternB.exec(fileContent);

    if (matchA && matchB) {
      const variableValueBorder = matchA[1].trim();
      const variableValueBg3 = matchB[1].trim();

      console.log(`Value of ${variableNameA}: ${variableValueBorder}`);
      console.log(`Value of ${variableNameB}: ${variableValueBg3}`);

      const matchedBorder = fileContent.replace(
        regexPatternA,
        `${variableNameA}: ${variableValueBg3} ${quote}`
      );

      let fileToWrite = fs.writeFileSync(
        path.join(__dirname, '../', "output", "/", StateStarterPaths[i]),
        matchedBorder
      );
    } else {
      console.log(
        `Variable ${variableNameA} or  ${variableNameB}  not found.`
      );
    }
  }
}

    

function copyFilesToInnerDirectory(file, dir){
    const _file = file;
    const _fileName = path.basename(_file);
    const _destPath = path.join(dir, _fileName);
    fsExtra.copySync(file, _destPath)
}



function selectWorkingFiles(){
    const fileDialog = new QFileDialog();
    fileDialog.setFileMode(FileMode.ExistingFiles);
    fileDialog.setNameFilter('Images (*.css)');
    fileDialog.exec();
    const selectedFiles = fileDialog.selectedFiles();
    console.log(selectedFiles);

    for (let i = 0; i < selectedFiles.length; i++) {
        copyFilesToInnerDirectory(selectedFiles[i], filesPathStarter);
    }
}



win.show();

global.win = win;