const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "santa-importer.formatImports",
    function () {
      const allowedLangs = ["typescript", "javascript", "javascriptreact"];

      if (
        !allowedLangs.find(
          (lang) => lang === vscode.window.activeTextEditor.document.languageId
        )
      ) {
        vscode.window.showErrorMessage(
          `drop that coffee mug, are you even on the right file? lol we only work with these types: ${allowedLangs.join(
            ", "
          )}`
        );
        return;
      }

      const activeFileText = vscode.window.activeTextEditor.document.getText();
      const lineCount = vscode.window.activeTextEditor.document.lineCount;

      const getImportsRegExp = RegExp(/import\s(?:.*?,)?\s?{([^}]+,?)+}/g);

      const importsMatched = activeFileText.match(getImportsRegExp);

      let virtualText = `${activeFileText}`;

      let iteration = 0;

      if (!importsMatched) return;

      do {
        const iterationImport = importsMatched[iteration].match(/{([^}]+,?)+}/)[0];

        const individualImports = iterationImport.match(/\s?.*?,|.*?}/g);

        // remove sujeira do regex
        if (individualImports.findIndex((la) => la === "}") !== -1)
          individualImports.splice(
            individualImports.findIndex((la) => la === "}"),
            1
          );

        const formatedMatches = individualImports.map((match) => {
          let returnValue = match
            .replace(/{\s?/, "")
            .replace(" }", "")
            .replace("\\n")
            .trim();

          if (returnValue && !returnValue.includes(",")) returnValue += ",";

          return returnValue;
        });

        // remove sujeira que pode ter vindo no map
        if (formatedMatches[formatedMatches.length - 1] === "}") {
          formatedMatches.splice(formatedMatches.length - 1, 1);
        }

        // organiza em arvore de natal
        formatedMatches.sort((item, jitem) =>
          item.length > jitem.length ? 1 : -1
        );

        // substitui o texto dependendo se for um import de uma linha ou de verias linhas
        if (formatedMatches.length <= 1) {
          virtualText = virtualText.replace(iterationImport, `{ ${formatedMatches[0]} }`);
        } else {
          virtualText = virtualText.replace(
            iterationImport,
            `{\r\n  ${formatedMatches.join("\r\n  ")} \r\n}`
          );
        }

        iteration++;
      } while (iteration < importsMatched.length);

      // substitui o texto do editor ativo com o ordenado.
      vscode.window.activeTextEditor.edit((editor) => {
        const pos1 = new vscode.Position(0, 0);
        const pos2 = new vscode.Position(lineCount, 0);

        const range = new vscode.Range(pos1, pos2);

        editor.replace(range, virtualText);

        vscode.window.showInformationMessage('water is better than coffee.')
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {
  vscode.window.showInformationMessage("that's exactly what a coffee drinker would do...")
}

module.exports = {
  activate,
  deactivate,
};
