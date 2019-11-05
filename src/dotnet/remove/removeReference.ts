import { getCsproj } from "../../util/ProjectSelector";
import { dotnetListReferences, dotnetRemoveReference } from "../../util/execDotnet";
import { window, ProgressLocation } from "vscode";

/**
 * Interactive Dialog using QuickPick input to remove a project-to-project reference.
 */
export async function removeReference() {
    const projectPath = await getCsproj();
    const referenceProjectPath = await selectReference(projectPath);
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Removing project reference`,
        cancellable: false
    }, (progress, token) => {
        return dotnetRemoveReference(projectPath, referenceProjectPath);
    });
}

/**
 * Interactive Dialog using QuickPick input choose a reference from a list of used project references.
 */
async function selectReference(projectPath: string) : Promise<string> {
    const reference = await window.showQuickPick(dotnetListReferences(projectPath),
        { placeHolder: "Select Reference to remove"});
    if(!reference) {
        throw new Error("No reference chosen")
    } else {
        return reference;
    }
}