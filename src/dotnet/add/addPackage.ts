import { ExtensionContext, Disposable, window, QuickPickItem, ProgressLocation } from 'vscode';

import { dotnetAddPackage, dotnetListPackages } from '../../util/execDotnet';
import { getCsproj } from '../../util/ProjectSelector';
import { searchAutocompletePackageId, searchAutocompleteVersion } from '../../util/nugetApi';

export async function addPackage(context: ExtensionContext) {
    try {
        const projectPath = await getCsproj();
        const packageId = await searchPackage();
        const version = await pickVersion(packageId, projectPath);
        return await window.withProgress({
            location: ProgressLocation.Notification,
            title: `Install package ${packageId}`,
            cancellable: false
        }, (progress, token) => {
            return dotnetAddPackage(projectPath, packageId, version);
        });
    } catch(reason) {
        window.showWarningMessage(reason);
    };
}

async function pickVersion(packageId: string, projectPath: string) {
    return new Promise<string>((resolve, reject) => {
        window.showQuickPick(getVersions(packageId, projectPath),
        { placeHolder: "Choose version"}).then((version) => {
            if(!version) {
                reject("No version chosen")
            } else{ 
                resolve(version);
            }
        });
    });
}

async function getVersions(packageId: string, projectPath: string) {
    var versions = await searchAutocompleteVersion(packageId);
    const installedPackage = (await dotnetListPackages(projectPath)).filter(el => el.label == packageId);
    if (installedPackage.length == 1) {
        const installedVersion = installedPackage[0].details;
        versions = versions.filter(v => v != installedVersion);
    }
    return versions;
}


async function searchPackage() {
    const disposables: Disposable[] = [];
	try {
		return new Promise<string>((resolve, reject) => {
            const disposables: Disposable[] = [];
            const input = window.createQuickPick<QuickPickItem>();
            input.ignoreFocusOut = true;
            input.placeholder = "Search Nuget Package";
            disposables.push(
                input.onDidChangeValue(async (value) => {
                    if (!value) {
                        input.items = [];
                        return;
                    }
                    input.busy = true;
                    try {
                        const packageIds = await searchAutocompletePackageId(value);
                        input.items = packageIds.map((packageId: string) => ({label: packageId}));
                        input.busy = false;
                    } catch(reason) {
                        input.busy = false;
                        reject("Error while fetching the nuget API: " + reason.message);
                    }
                }),
                input.onDidChangeSelection(items => {
					const item = items[0];
                    resolve(item.label);
                    input.hide();
                }),
                input.onDidHide(() => {
					reject("No package chosen");
					input.dispose();
				})
            );
            input.show();
		});
	} finally {
		disposables.forEach(d => d.dispose());
    }
}
