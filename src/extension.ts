import * as vscode from 'vscode';
import { addPackage } from './dotnet/add/addPackage'
import { removePackage } from './dotnet/remove/removePackage';
import { addReference } from './dotnet/add/addReference';
import { removeReference } from './dotnet/remove/removeReference';
import { addProject } from './dotnet/sln/addProject';
import { removeProject } from './dotnet/sln/removeProject';
import { newFromTemplate } from './dotnet/new/new';

export function activate(context: vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.add.package', 
		async () => runAndshowErrorAsMessage(addPackage)));

	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.remove.package', 
		async () => runAndshowErrorAsMessage(removePackage)));
	
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.add.reference', 
		async () => runAndshowErrorAsMessage(addReference)));

	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.remove.reference', 
		async () => runAndshowErrorAsMessage(removeReference)));
	
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.sln.add', 
		async () => runAndshowErrorAsMessage(addProject)));

	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.sln.remove', 
		async () => runAndshowErrorAsMessage(removeProject)));

	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.new', 
		async () => runAndshowErrorAsMessage(newFromTemplate)));
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function runAndshowErrorAsMessage(func: () => Promise<string[]>) { 
	try {
		await func();
	} catch(error) {
        var message: string;
        if (error instanceof Error) {
            message = error.message;
        } else {
            message = error;
        }
        vscode.window.showWarningMessage(message);
    };
}
