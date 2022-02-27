// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "santa-importer" is now active!'
  );

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

      const wholeFileText = vscode.window.activeTextEditor.document.getText();
      const lines = vscode.window.activeTextEditor.document.lineCount;

      const reg = RegExp(/import\s(?:.*?,)?\s?{([^}]+,?)+}/g);

      const result = wholeFileText.match(reg);

      let newText = `${wholeFileText}`;

      let iteration = 0;

      if (!result) return;

      do {
        const iterMatch = result[iteration].match(/{([^}]+,?)+}/)[0];

        const matches = iterMatch.match(/\s?.*?,|.*?}/g);

        if (matches.findIndex((la) => la === "}") !== -1)
          matches.splice(
            matches.findIndex((la) => la === "}"),
            1
          );

        const formatedMatches = matches.map((match) => {
          let returnValue = match
            .replace(/{\s?/, "")
            .replace(" }", "")
            .replace("\\n")
            .trim();

          if (returnValue && !returnValue.includes(",")) returnValue += ",";

          return returnValue;
        });

        if (formatedMatches[formatedMatches.length - 1] === "}") {
          formatedMatches.splice(formatedMatches.length - 1, 1);
        }

        formatedMatches.sort((item, jitem) =>
          item.length > jitem.length ? 1 : -1
        );

        if (formatedMatches.length <= 1) {
          newText = newText.replace(iterMatch, `{ ${formatedMatches[0]} }`);
        } else {
          newText = newText.replace(
            iterMatch,
            `{\r\n  ${formatedMatches.join("\r\n  ")} \r\n}`
          );
        }

        iteration++;
      } while (iteration < result.length);

      vscode.window.activeTextEditor.edit((editor) => {
        const pos1 = new vscode.Position(0, 0);
        const pos2 = new vscode.Position(lines, 0);

        const range = new vscode.Range(pos1, pos2);

        editor.replace(range, newText);

        vscode.window.showInformationMessage('water is better than coffee.')
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
