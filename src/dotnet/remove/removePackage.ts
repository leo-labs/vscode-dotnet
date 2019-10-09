import { ExtensionContext, window, ProgressLocation } from "vscode";
import { getCsproj } from "../../util/ProjectSelector";
import { dotnetRemovePackage, dotnetListPackages } from "../../util/execDotnet";

export async function removePackage(context: ExtensionContext) {
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
    } catch(reason) {
        window.showWarningMessage(reason);
    };
}

async function selectPackage(projectPath: string) : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        window.showQuickPick(dotnetListPackages(projectPath),
        { placeHolder: "Select Package to remove"}).then((packageId) => {
            if(!packageId) {
                reject("No package chosen")
            } else {
                resolve(packageId.label);
            }
        });
    });
}
