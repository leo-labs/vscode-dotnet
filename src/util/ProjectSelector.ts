import { window, workspace, QuickPickItem, extensions, WorkspaceFolder, Uri } from 'vscode';
import * as fs from 'fs';
import { dotnetSln } from './execDotnet';

/**
 * Interactive Dialog using QuickPick input to choose a csharp project
 * from a list of projects
 */
export async function getCsproj() : Promise<string> {
    const projects = await window.showQuickPick(getCsharpProjects(), { placeHolder: "Choose a project"});
    if(!projects) {
        throw new Error("No project choosen")
    }
    return projects;
}

/**
 * Obtain a list of csharp projects. If there is a solution file (.sln) present,
 * return the projects in the solution. Else search for a .csproj file in the workspace
 * directory.
 */
async function getCsharpProjects() : Promise<string[]> {
    var workspace = await getWorkspace();
    return new Promise((resolve, reject) => {
        fs.readdir(workspace.uri.path, (error, files) => {
            let absolutePath = function(file: string) : string { 
                return workspace.uri.path + "/" + file;
            };
            const sln_files = files.filter(file => /\.sln$/.test(file));
            if (sln_files.length == 1) {
                return dotnetSln(absolutePath(sln_files[0]) + " list").then((projects) => {
                    resolve(projects.map((project) => absolutePath(project)));
                });
            } else if(sln_files.length == 0) {
                const csproj_files = files.filter(file => /\.csproj$/.test(file));
                resolve(csproj_files.map((file) => absolutePath(file)));
            } else {
                reject("More than one .sln file in workspace");
            }
        });
    });
}

/**
 * Interactive Dialog using QuickPick input to choose a workspace folder
 * if multiple workspaces are currently open. Throws an error if no workspace is open.
 */
async function getWorkspace() : Promise<WorkspaceFolder> {
    const workspaceFolders = workspace.workspaceFolders;
    if(!workspaceFolders) {
        throw new Error("No workspace is open.");
    }

    if(workspaceFolders.length == 1) {
        return workspaceFolders[0];
    }

    var workspaceFolder = await window.showQuickPick(workspaceFolders.map((folder) => ({label: folder.name, details: folder.uri, index: folder.index})),
        { placeHolder: "Select workspace"});
    if(workspaceFolder) {
        return workspaceFolders[workspaceFolder.index];
    }
    throw new Error("No workspace selected");

}