import { window, ProgressLocation } from "vscode";

import { selectProject, getCsprojects } from "../../util/ProjectSelector";
import { dotnetRemovePackage, dotnetListPackages } from "../../util/execDotnet";

/**
 * Interactive Dialog using QuickPick input to uninstall a NuGet package
 */
export async function removePackage() {
    const projectPath = await selectProject(getCsprojects());
    const packageId = await selectPackage(projectPath);
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Install package ${packageId}`,
        cancellable: false
    }, (progress, token) => {
        return dotnetRemovePackage(projectPath, packageId);
    });
}

/**
 * Interactive Dialog using QuickPick input choose a package from a list of installed packages
 */
async function selectPackage(projectPath: string) : Promise<string> {
    const packageId = await window.showQuickPick(dotnetListPackages(projectPath),
        { placeHolder: "Select Package to remove"});
    if(!packageId) {
        throw new Error("No package chosen")
    } else {
        return packageId.label;
    }
}
