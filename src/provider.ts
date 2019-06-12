/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';
import * as path from 'path';
import { execSync } from 'child_process';

export enum scopemode {
  FIND_SYMBOL = 0,
  FIND_GLOBAL_DEFINITION = 1,
  FIND_THID_TEXT_STRING = 4,
};
export default class Provider implements vscode.TextDocumentContentProvider {

  static scheme = 'references';
  constructor() {

    // Listen to the `closeTextDocument`-event which means we must
    // clear the corresponding model object - `ReferencesDocument`
  }

  dispose() {
  }

  parseScopeInformation(scope: string): [string, string, string] {
    let Info = scope.split(" ");
    let Path: string = "";
    let Line: string = "";
    let Desc: string = "";
    let dIdx: number = 0;
    Path = Info[dIdx++];
    dIdx++;
    Line = Info[dIdx++];
    while (dIdx < Info.length) {
      Desc += Info[dIdx++];
      Desc += " ";
    }
    return [Path, Line, Desc];
  }

  // Provider method that takes an uri of the `references`-scheme and
  // resolves its content by (1) running the reference search command
  // and (2) formatting the results
  provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
    const [target, pos, symbol, mode] = decodeLocation(uri);
    let result: string;
    let cmd: string;
    let parse: string = "";
    let CurrentPath: string = "";
    let dIdx: number = 0;
    let scope;
    cmd = 'gtags-cscope -dL ';
    cmd += ("-" + mode.toString() + " ");
    cmd += symbol;
    try {
      result = execSync(cmd, {
        encoding: "UTF-8",
        cwd: vscode.workspace.rootPath
      }).toString();
    } catch (error) {
      vscode.window.showInformationMessage('Occurred error' + error);
      return "";
    }
    scope = result.split("\n");
    switch (mode) {
      case scopemode.FIND_SYMBOL:
        parse += '------------>Find Symbol(';
        parse += symbol;
        parse += ')\n\n\n';
        break;
      case scopemode.FIND_GLOBAL_DEFINITION:
        parse += '------------>Find Global Definition(';
        parse += symbol;
        parse += ')\n\n\n';
        break;
      case scopemode.FIND_THID_TEXT_STRING:
        parse += '------------>Find Thid Text String(';
        parse += symbol;
        parse += ')\n\n\n';
        break;
      default:
        vscode.window.showInformationMessage('Error scope mode');
        return "";
        break;
    }
    while (dIdx < scope.length) {
      const [path, line, desc] = this.parseScopeInformation(scope[dIdx]);
      if ((path !== "") && (line !== "") && (desc !== "")) {
        if (CurrentPath.match(path)) {
          parse += '\t\t';
          parse += line;
          parse += ':  ';
          parse += desc;
          parse += '\n';
        }
        else {
          CurrentPath = path;
          parse += path;
          parse += ':\n';
          parse += '\t\t';
          parse += line;
          parse += ':  ';
          parse += desc;
          parse += '\n';
        }
      }
      dIdx += 1;
    }
    return parse;
  }
}

let seq = 0;

export function encodeLocation(uri: vscode.Uri, pos: vscode.Position,
  symbol: string, Mode: scopemode): vscode.Uri {
  const query = JSON.stringify([uri.toString(), pos.line, pos.character, symbol, Mode]);
  return vscode.Uri.parse(`${Provider.scheme}:References.locations?${query}#${seq++}`);
}

function decodeLocation(uri: vscode.Uri):
  [vscode.Uri, vscode.Position, string, scopemode] {
  let [target, line, character, symbol, mode] =
    <[string, number, number, string, scopemode]>JSON.parse(uri.query);
  return [vscode.Uri.parse(target), new vscode.Position(line, character), symbol, mode];
}
