import { selectProject, getCsprojFromFileSystem, getCsprojects } from "../../util/ProjectSelector";
import { window, ProgressLocation } from "vscode";
import { dotnetAddReference } from "../../util/execDotnet";

/**
 * Interactive Dialog using QuickPick input to add a project-to-project reference
 */
export async function addReference() {
    const projectPath = await selectProject(getCsprojects());
    const referenceProjectPath = await getCsprojFromFileSystem();
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Adding project reference`,
        cancellable: false
    }, (progress, token) => {
        return dotnetAddReference(projectPath, referenceProjectPath);
    });
}