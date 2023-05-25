const { QMainWindow, QWidget, QLabel, FlexLayout, QPushButton, 
    QFileDialog, QIcon, QLineEdit, FileMode } = require('@nodegui/nodegui');
//const { tokenizer } = require('@csstools/tokenizer');
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


function replaceVariables(variableNameDefault, variableNameReplacer) {
  const StateStarterPaths = State.workingFiles;
  clearDirectory(outputPath);
  const quote = `  /* ---Modified On ${generateTodaysDate()} by Nik--- */  `
  const encoding = "utf8";
  // const variableNameDefault = a;
  const regexPatternDefault = new RegExp(`\\${variableNameDefault}\\:\\s*([^;]+;)`, "g");
  // const variableNameReplacer = b;
  const regexPatternReplacer = new RegExp(`\\${variableNameReplacer}\\:\\s*([^;]+)`, "g");
  let modifiedCssString;
  
  for (let i = 0; i < StateStarterPaths.length; i++) {
    const fileContent = fs.readFileSync(
      path.join(filesPathStarter, "/", StateStarterPaths[i]),
      encoding
    );

    modifiedCssString = fileContent;

    let [defaultLight, defaultDark] = fileContent.match(regexPatternDefault);

    let [replacerLight, replacerDark] = fileContent.match(regexPatternReplacer);

    console.log({defaultLight, defaultDark, replacerLight, replacerDark});
    const replacerLightValue = replacerLight.split(":")[1];

    modifiedCssString = modifiedCssString.replace(defaultLight, `${variableNameDefault}: ${replacerLightValue}; ${quote}`);
    
    if (defaultDark && replacerDark) {
      const replacerDarkValue = replacerDark.split(":")[1];
      modifiedCssString = modifiedCssString.replace(defaultDark, `${variableNameDefault}: ${replacerDarkValue}; ${quote}`);
    }

    fs.writeFileSync(
      path.join(__dirname, '../', "output", "/", StateStarterPaths[i]),
      modifiedCssString
    );
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

    for (let i = 0; i < selectedFiles.length; i++) {
        copyFilesToInnerDirectory(selectedFiles[i], filesPathStarter);
    }
}



win.show();

global.win = win;