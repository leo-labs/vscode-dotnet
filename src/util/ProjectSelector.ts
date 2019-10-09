import { window, workspace, QuickPickItem, extensions, WorkspaceFolder, Uri } from 'vscode';
import * as child from 'child_process';
import * as fs from 'fs';
import { dotnetSln } from './execDotnet';

export async function getCsproj() : Promise<string> {
    return new Promise<string>((resolve, reject) => {
        window.showQuickPick(getCsharpProjects(), { placeHolder: "Choose a project"}).then((projects) => {
            if(!projects) {
                reject("No project choosen")
            }
            resolve(projects);
        });
    });
}

async function getCsharpProjects() : Promise<string[]> {
    return getWorkspace().then((workspace) => {
        return new Promise((resolve, reject) => {
            fs.readdir(workspace.uri.path, (error, files) => {
                const sln_files = files.filter(file => /\.sln$/.test(file));
                if (sln_files.length == 1) {
                    resolve(dotnetSln(`${workspace.uri.path}/${sln_files[0]} list`));
                } else if(sln_files.length == 0) {
                    const csproj_files = files.filter(file => /\.csproj$/.test(file));
                    resolve(csproj_files.map((file) => workspace.uri.path + "/" + file));
                } else {
                    reject("More than one .sln file in workspace");
                }
            });
        });
    });
}

async function getWorkspace() : Promise<WorkspaceFolder> {
    const workspaceFolders = workspace.workspaceFolders;
    if(!workspaceFolders) {
        throw new Error("No workspace is open.");
    }

    if(workspaceFolders.length == 1) {
        return workspaceFolders[0];
    }

    return new Promise<WorkspaceFolder>((resolve, reject) => {
        window.showQuickPick(workspaceFolders.map((folder) => ({label: folder.name, details: folder.uri, index: folder.index})),
            { placeHolder: "Select workspace"}).then((workspace) => {
                if(workspace) {
                    return resolve(workspaceFolders[workspace.index]);
                }
                reject("No workspace selected")
            }
        );
    });
}