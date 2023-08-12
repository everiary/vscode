import * as vscode from "vscode";
import * as crypto from "crypto";
import axios from 'axios';


function getDate() {
  var date = new Date();
  let year = date.getFullYear().toString();
  let m = date.getMonth() + 1;
  let month = m < 10 ? "0" + m.toString() : m.toString();
  let d = date.getDay();
  let day = d < 10 ? "0" + d.toString() : d.toString();
  var t = year + "-" + month + "-" + day;
  return t;
}

function getMd5(str: string) {
  let hash = crypto.createHash("md5");
  hash.update(str);
  return hash.digest("hex");
}


export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "everiary.send",
    async function () {
      const editor = vscode.window.activeTextEditor;
      const selection = editor?.selection;
      const selectedText = editor?.document.getText(selection);
      if (!selectedText) {
        vscode.window
          .showInputBox({
            password: false, // 输入内容是否是密码
            ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
            placeHolder: "你想到了什么？", // 在输入框内的提示信息
          })
          .then(function (msg) {
            vscode.window
              .showInformationMessage(
                "everiary",
                {
                  modal: true,
                  detail: ("是否发送以下内容: " +
                    "\n" +
                    getDate() +
                    "-" +
                    getMd5(msg as string).substring(0, 8) +
                    "\n" +
                    msg) as string,
                },
                "ok"
              )
              .then((s) => {
                if (s) {
                  let data = {
                    title:
                      getDate() + "-" + getMd5(msg as string).substring(0, 8),
                    content: msg as string,
                  };
                  axios.post("http://localhost:3000"+"/api/ever", data)
                    .then((res) => {
                      vscode.window.showInformationMessage(JSON.stringify(res.data));
                    }).catch(error=>{
                      console.log(error);
                    });
                } else {
                  return;
                }
              });
          });
      } else {
        vscode.window
          .showInformationMessage(
            "everiary",
            {
              modal: true,
              detail:
                "是否发送以下内容: " +
                "\n" +
                getDate() +
                "--" +
                getMd5(selectedText).substring(0, 8) +
                "\n" +
                selectedText,
            },
            "ok"
          )
          .then((s) => {
            if (s) {
              let data = {
                title: getDate() + "--" + getMd5(selectedText).substring(0, 8),
                content: selectedText,
              };
              axios.post("http://localhost:3000/api/ever", data)
                .then((res) => {
                  vscode.window.showInformationMessage(JSON.stringify(res.data));
                }).catch(error=>{
                  console.log(error);
                });
            }
          });
      }
    }
  );
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
