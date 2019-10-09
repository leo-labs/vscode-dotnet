import * as vscode from 'vscode';
import { addPackage } from './dotnet/add/addPackage'
import { removePackage } from './dotnet/remove/removePackage';

export function activate(context: vscode.ExtensionContext) {
	

	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.add.package', 
		async () => addPackage(context)));

	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.remove.package', 
		async () => removePackage(context)));
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
