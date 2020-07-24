
import { Disposable, window, QuickPickItem, ProgressLocation } from 'vscode';

import { dotnetAddPackage, dotnetListPackages } from '../../util/execDotnet';
import { selectProject, getCsprojects } from '../../util/ProjectSelector';
import { searchAutocompletePackageId, searchAutocompleteVersion } from '../../util/nugetApi';
import { CreatePackageQuickPickItem, PackageQuickPickItem } from '../add/PackageQuickPickItem';
import debounce = require('lodash.debounce');
import difference = require('lodash.difference');

/**
 * Interactive Dialog using QuickPick input to install or upgrade a NuGet package
 */
export async function addPackage() {
    const projectPath = await selectProject(getCsprojects());
    const packageId = await searchPackage();
    const version = await pickVersion(packageId, projectPath);
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Adding package ${packageId}`,
        cancellable: false
    }, (progress, token) => {
        return dotnetAddPackage(projectPath, packageId, version);
    });
}

/**
 * Interactive Dialog using QuickPick input to choose a NuGet package ID and version
 */
async function pickVersion(packageId: string, projectPath: string) {
    const version = await window.showQuickPick(getVersions(packageId, projectPath),
        { placeHolder: "Choose version"});
    if(!version) {
        throw new Error("No version chosen")
    } else{ 
        return version;
    }
}

/**
 * Gets all but the installed versions for a package in a project
 */
async function getVersions(packageId: string, projectPath: string) : Promise<string[]> {
    var versions = await searchAutocompleteVersion(packageId);
    const installedPackage = (await dotnetListPackages(projectPath)).filter(el => el.label == packageId);
    if (installedPackage.length == 1) {
        const installedVersion = installedPackage[0].description;
        versions = versions.filter(v => v != installedVersion);
    }
    return versions;
}

/**
 * Interactive dialog using QuickPick and autocomplete to search the NuGet
 * package index for packages and obtain the packageId
 */
async function searchPackage() : Promise<string> {
    const disposables: Disposable[] = [];
    var debouncedLoaderMetadata: any;
    var debouncedLoaderAutoComplete: any;
	try {
		return new Promise<string>((resolve, reject) => {
            const disposables: Disposable[] = [];
            const input = window.createQuickPick<QuickPickItem>();
            input.ignoreFocusOut = true;
            input.placeholder = "Search Nuget Package";
            disposables.push(
                input.onDidChangeValue(async (value) => {
                    if(debouncedLoaderAutoComplete) {
                        debouncedLoaderAutoComplete.cancel();
                        if(debouncedLoaderMetadata) {
                            debouncedLoaderMetadata.cancel();
                        }
                    }
                    debouncedLoaderAutoComplete = debounce(async () => {
                        if(debouncedLoaderMetadata) {
                            debouncedLoaderMetadata.cancel();
                        }
                        if (!value) {
                            input.items = [];
                            return;
                        }
                        input.busy = true;
                        try {
                            const packageIds = await searchAutocompletePackageId(value);
                            input.items = packageIds.map((packageId: string) => ({label: packageId}));
                        } catch(reason) {
                            input.busy = false;
                            reject("Error while fetching the nuget API: " + reason.message);
                        }
                        
                        debouncedLoaderMetadata = debounce(async () => {
                            var packageIds = input.items.map(item => item.label);
                            const detailedItems = await loadPackageMetadata(packageIds);

                            // only update if the filter has not changed in between
                            if (difference(packageIds, input.items.map(item => item.label)).length === 0) {
                                input.items = detailedItems;
                                input.activeItems = detailedItems.filter(item => item.label == input.activeItems[0].label);
                                input.busy = false;
                            }
                        }, 250);
                        debouncedLoaderMetadata();
                    }, 250);
                    debouncedLoaderAutoComplete();
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

/**
 * load package metadata as `PackageQuickPickItem`
 */
async function loadPackageMetadata(packageIds: readonly string[]) {
    return await Promise.all(packageIds.map(async packageId => {
        return await CreatePackageQuickPickItem(packageId);
    }));
} 
