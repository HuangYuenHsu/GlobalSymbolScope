/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { execSync } from 'child_process';
export default class Provider implements vscode.TextDocumentContentProvider {

  static scheme = 'references';
  constructor() {

    // Listen to the `closeTextDocument`-event which means we must
    // clear the corresponding model object - `ReferencesDocument`
  }

  dispose() {
  }

  // Provider method that takes an uri of the `references`-scheme and
  // resolves its content by (1) running the reference search command
  // and (2) formatting the results
  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
    const [target, pos, symbol] = decodeLocation(uri);
    let result : string;
    let cmd : string;
    cmd = 'gtags-cscope -dL -0 ';
    cmd += symbol;
    try {
      result = execSync(cmd, { encoding: "UTF-8", cwd: vscode.workspace.rootPath}).toString();
    } catch (error) {
      vscode.window.showInformationMessage('Occurred error' + error);
      return "";
    }
    return result;
  }
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position, symbol: string): vscode.Uri {
  const query = JSON.stringify([uri.toString(), pos.line, pos.character, symbol]);
  return vscode.Uri.parse(`${Provider.scheme}:References.locations?${query}#${seq++}`);
}

export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position, string] {
  let [target, line, character, symbol] = <[string, number, number, string]>JSON.parse(uri.query);
  return [vscode.Uri.parse(target), new vscode.Position(line, character), symbol];
}
