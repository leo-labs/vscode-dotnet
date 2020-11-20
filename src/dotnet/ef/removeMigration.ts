import { window, ProgressLocation } from "vscode";
import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetEfRemoveMigration } from "../../util/execDotnet";
import { outputHeader } from "../../extension";

/**
 * Interactive Dialog using QuickPick input to remove EF migration
 */
export async function removeMigration() {
	const projectPath = await selectProject(getCsprojects());
	return window.withProgress({
		location: ProgressLocation.Notification,
		title: `Removing migration`,
		cancellable: false
	}, (progress, token) => {
		outputHeader("DOTNET EF MIGRATIONS REMOVE");
		return dotnetEfRemoveMigration(projectPath);
	});
}