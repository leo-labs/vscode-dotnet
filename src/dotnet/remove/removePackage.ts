import { window, ProgressLocation } from "vscode";

import { getCsproj } from "../../util/ProjectSelector";
import { dotnetRemovePackage, dotnetListPackages } from "../../util/execDotnet";

/**
 * Interactive Dialog using QuickPick input to uninstall a NuGet package
 */
export async function removePackage() {
    try {
        const projectPath = await getCsproj();
        const packageId = await selectPackage(projectPath);
        return await window.withProgress({
            location: ProgressLocation.Notification,
            title: `Install package ${packageId}`,
            cancellable: false
        }, (progress, token) => {
            return dotnetRemovePackage(projectPath, packageId);
        });
    } catch(error) {
        var message: string;
        if (error instanceof Error) {
            message = error.message;
        } else {
            message = error;
        }
        window.showWarningMessage(message);
    };
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
