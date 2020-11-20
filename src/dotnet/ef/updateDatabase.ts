import { window, ProgressLocation } from "vscode";
import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetEfUpdateDatabase } from "../../util/execDotnet";
import { outputHeader } from "../../extension";

/**
 * Interactive Dialog using QuickPick input to update EF database
 */
export async function updateDatabase() {
	const projectPath = await selectProject(getCsprojects());
	const migrationName = await pickName();
	return window.withProgress({
		location: ProgressLocation.Notification,
		title: `Updating database`,
		cancellable: false
	}, (progress, token) => {
		outputHeader("DOTNET EF DATABASE UPDATE");
		return dotnetEfUpdateDatabase(projectPath, migrationName);
	});
}

/**
 * QuickPick dialog for choosing a name
 */
async function pickName() {
	const name = await window.showInputBox({ prompt: "(optional) Specify the target migration name" });
	return name;
}