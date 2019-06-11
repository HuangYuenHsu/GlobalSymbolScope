// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ContentProvider, { encodeLocation } from './provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const provider = new ContentProvider();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	const providerRegistrations = vscode.Disposable.from(
		vscode.workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider),
	);

	const commandRegistration = vscode.commands.registerTextEditorCommand('editor.printReferences', editor => {
		let select: string;
		select = editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.active));
		if ((select) && (editor.document.getText().length !== select.length)) {
			const uri = encodeLocation(editor.document.uri, editor.selection.active, select);
			return vscode.workspace.openTextDocument(uri).then(doc => vscode.window.showTextDocument(doc, editor.viewColumn! + 1));
		}
		return null;
	});

	context.subscriptions.push(
		providerRegistrations,
		commandRegistration,
		provider);
}

// this method is called when your extension is deactivated
export function deactivate() { }
