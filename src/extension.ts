import * as vscode from 'vscode';
import { addPackage } from './dotnet/add/addPackage'
import { removePackage } from './dotnet/remove/removePackage';
import { addReference } from './dotnet/add/addReference';
import { removeReference } from './dotnet/remove/removeReference';
import { addProject } from './dotnet/sln/addProject';
import { removeProject } from './dotnet/sln/removeProject';
import { newFromTemplate } from './dotnet/new/new';
import { addMigration } from './dotnet/ef/addMigration';
import { removeMigration } from './dotnet/ef/removeMigration';
import { updateDatabase } from './dotnet/ef/updateDatabase';
import { dbContextInfo } from './dotnet/ef/dbContextInfo';
import { migrationsList } from './dotnet/ef/migrationsList';

export let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("dotnet ef");
	context.subscriptions.push(outputChannel);

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
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.ef.migrations.add',
		async () => runAndshowErrorAsMessage(addMigration)));
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.ef.migrations.remove',
		async () => runAndshowErrorAsMessage(removeMigration, true)));
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.ef.database.update',
		async () => runAndshowErrorAsMessage(updateDatabase, true)));
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.ef.dbcontext.info',
		async () => runAndshowErrorAsMessage(dbContextInfo, true)));
	context.subscriptions.push(vscode.commands.registerCommand('extension.dotnet.ef.migrations.list',
		async () => runAndshowErrorAsMessage(migrationsList, true)));

}

// this method is called when your extension is deactivated
export function deactivate() { }

async function runAndshowErrorAsMessage(func: () => Promise<string[]>, showOutput = false) {
	try {
		// some operations require the display of (potentially) long output to the user
		const output = await func();
		if (showOutput && output.length > 0) {
			outputMessage(output);
		}
	} catch (error) {
		var message: string;
		if (error instanceof Error) {
			message = error.message;
		} else {
			message = error;
		}
		vscode.window.showWarningMessage(message);
	}
}

export function outputHeader(header: string) {
	outputChannel.appendLine("--------------------------------------------------------------------------------");
	outputChannel.appendLine("");
	outputChannel.appendLine(`** ${header} **`);
	outputChannel.appendLine("");
}

function outputMessage(output: string[]) {
	output.forEach(msg => {
		if (!msg.startsWith('Build started') && !msg.startsWith("Build succeeded")) {
			outputChannel.appendLine(msg);
		}
	});
	outputChannel.show();
}