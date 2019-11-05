import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetListReferences, dotnetRemoveReference } from "../../util/execDotnet";
import { window, ProgressLocation } from "vscode";

/**
 * Interactive Dialog using QuickPick input to remove a project-to-project reference.
 */
export async function removeReference() {
    const projectPath = await selectProject(getCsprojects());
    const referenceProjectPath = await selectProject(dotnetListReferences(projectPath));
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Removing project reference`,
        cancellable: false
    }, (progress, token) => {
        return dotnetRemoveReference(projectPath, referenceProjectPath);
    });
}
