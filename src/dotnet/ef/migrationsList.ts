import { window, ProgressLocation } from "vscode";
import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetEfMigrationsList } from "../../util/execDotnet";
import { outputHeader } from "../../extension";

/**
 * Interactive Dialog using QuickPick input to update EF database
 */
export async function migrationsList() {
	const projectPath = await selectProject(getCsprojects());
	return window.withProgress({
		location: ProgressLocation.Notification,
		title: `Getting migrations`,
		cancellable: false
	}, (progress, token) => {
		outputHeader("DOTNET EF MIGRATIONS LIST");
		return dotnetEfMigrationsList(projectPath);
	});
}