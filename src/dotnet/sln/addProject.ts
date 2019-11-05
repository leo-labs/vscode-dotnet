import { getCsprojFromFileSystem, getSolution, getWorkspace } from "../../util/ProjectSelector";
import { window, ProgressLocation } from "vscode";
import { dotnetSlnAdd } from "../../util/execDotnet";

/**
 * Interactive Dialog using QuickPick input to add a project to a solution
 */
export async function addProject() {
    const workspacePath = await getWorkspace();
    const solutionPath = await getSolution(workspacePath, true);
    const referenceProjectPath = await getCsprojFromFileSystem();
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Adding project to solution`,
        cancellable: false
    }, (progress, token) => {
        return dotnetSlnAdd(solutionPath, referenceProjectPath);
    });
}