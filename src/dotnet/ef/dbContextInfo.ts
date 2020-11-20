import { window, ProgressLocation } from "vscode";
import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetEfDbContextInfo } from "../../util/execDotnet";
import { outputHeader } from "../../extension";

/**
 * Interactive Dialog using QuickPick input to update EF database
 */
export async function dbContextInfo() {
    const projectPath = await selectProject(getCsprojects());
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Getting db context info`,
        cancellable: false
    }, (progress, token) => {
        outputHeader("DOTNET EF DB CONTEXT INFO");
        return dotnetEfDbContextInfo(projectPath);
    });
}