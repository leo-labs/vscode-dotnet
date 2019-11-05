import { getSolution, getWorkspace } from "../../util/ProjectSelector";
import { dotnetSlnList, dotnetSlnRemove } from "../../util/execDotnet";
import { window, ProgressLocation } from "vscode";
import * as path from 'path';

/**
 * Interactive Dialog using QuickPick input to remove a project reference from a solution
 */
export async function removeProject() {
    const workspacePath = await getWorkspace();
    const solutionPath = await getSolution(workspacePath, true);
    const referenceProjectPathRelative = await selectReference(solutionPath);
    const referenceProjectPathAbsolute = path.dirname(solutionPath) + "/" + referenceProjectPathRelative;
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Removing project from solution`,
        cancellable: false
    }, (progress, token) => {
        return dotnetSlnRemove(solutionPath, referenceProjectPathAbsolute);
    });
}


/**
 * Interactive Dialog using QuickPick input choose a reference from a list of used project references.
 */
async function selectReference(solutionPath: string) : Promise<string> {
    const reference = await window.showQuickPick(dotnetSlnList(solutionPath),
        { placeHolder: "Select Reference to remove"});
    if(!reference) {
        throw new Error("No reference chosen")
    } else {
        return reference;
    }
}