import { window, ProgressLocation, workspace } from "vscode";
import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetEfAddMigration } from "../../util/execDotnet";

/**
 * Interactive Dialog using QuickPick input to add a EF migration
 */
export async function addMigration() {
	const projectPath = await selectProject(getCsprojects());
	const migrationName = await pickName();
	return window.withProgress({
		location: ProgressLocation.Notification,
		title: `Scaffolding migration`,
		cancellable: false
	}, (progress, token) => {
		let watcher = workspace.createFileSystemWatcher("**/*.cs");
		watcher.onDidCreate(uri => {
			if (uri.path.indexOf("Designer") !== undefined) {
				workspace.openTextDocument(uri).then(doc => {
					window.showTextDocument(doc);
				});
				watcher.dispose();
			}
		});

		return dotnetEfAddMigration(projectPath, migrationName);
	});
}

/**
 * QuickPick dialog for choosing a name
 */
async function pickName() {
	const name = await window.showInputBox({ prompt: "Specify the migration name" });
	if (!name) {
		throw new Error("No name chosen");
	}
	return name;
}