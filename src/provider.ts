/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export default class Provider implements vscode.TextDocumentContentProvider {

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
    return "";
  }
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position): vscode.Uri {
  const query = JSON.stringify([uri.toString(), pos.line, pos.character]);
  return vscode.Uri.parse(`${Provider.scheme}:References.locations?${query}#${seq++}`);
}

export function decodeLocation(uri: vscode.Uri): [vscode.Uri, vscode.Position] {
  let [target, line, character] = <[string, number, number]>JSON.parse(uri.query);
  return [vscode.Uri.parse(target), new vscode.Position(line, character)];
}
