import { getSolution, getWorkspace, selectProject } from "../../util/ProjectSelector";
import { dotnetSlnList, dotnetSlnRemove } from "../../util/execDotnet";
import { window, ProgressLocation } from "vscode";
import * as path from 'path';

/**
 * Interactive Dialog using QuickPick input to remove a project from a solution
 */
export async function removeProject() {
    const workspacePath = await getWorkspace();
    const solutionPath = await getSolution(workspacePath, true);
    const referenceProjectPathRelative = await selectProject(dotnetSlnList(solutionPath));
    const referenceProjectPathAbsolute = path.dirname(solutionPath) + "/" + referenceProjectPathRelative;
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Removing project from solution`,
        cancellable: false
    }, (progress, token) => {
        return dotnetSlnRemove(solutionPath, referenceProjectPathAbsolute);
    });
}
