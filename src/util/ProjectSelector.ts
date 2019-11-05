import { window, workspace, WorkspaceFolder, OpenDialogOptions, RelativePattern, Uri } from 'vscode';
import { dotnetSlnList } from './execDotnet';
import * as path from 'path';

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
    const workspacePath = await getWorkspace();
    var solutionPath = await getSolution(workspacePath, false);
    if (solutionPath !== "") {
        const projectPaths = await dotnetSlnList(solutionPath);
        return projectPaths.map((projectPath) => path.dirname(solutionPath) + "/" + projectPath);
    } else {
        const pattern = new RelativePattern(workspacePath, '**/*.csproj');
        const csproj_files = await workspace.findFiles(pattern, null);
        return csproj_files.map((uri) => uri.path);    
    }
}
/**
 * Get path to solution file in workspace
 * @param throwIfNone throw an error if none is found or instead an empty string
 */
export async function getSolution(workspacePath: string, throwIfNone: boolean) : Promise<string> {
    let pattern = new RelativePattern(workspacePath, '**/*.sln');
    const sln_result = await workspace.findFiles(pattern, null, 2);

    if(sln_result.length == 1) {
        return sln_result[0].path;
    } else if (sln_result.length == 0) {
        if (throwIfNone) {
            throw new Error("No solution file in workspace.");
        }
        return "";
    } else {
        throw new Error("More than one solution file in workspace.")
    }
}

/**
 * Interactive Dialog using QuickPick input to choose a workspace folder
 * if multiple workspaces are currently open. Throws an error if no workspace is open.
 */
export async function getWorkspace() : Promise<string> {
    const workspaceFolders = workspace.workspaceFolders;
    if(!workspaceFolders) {
        throw new Error("No workspace is open.");
    }

    if(workspaceFolders.length == 1) {
        return workspaceFolders[0].uri.path;
    }

    const workspaceFolder = await window.showQuickPick(workspaceFolders.map((folder) => ({label: folder.name, details: folder.uri, index: folder.index})),
        { placeHolder: "Select workspace"});
    if(workspaceFolder) {
        return workspaceFolders[workspaceFolder.index].uri.path;
    }
    throw new Error("No workspace selected");
}

/**
 * Interactive File Open dialog to pick a csproj file from filesystem to add as reference
 */
export async function getCsprojFromFileSystem() : Promise<string> {
    const options: OpenDialogOptions = {
        canSelectMany: false,
        openLabel: 'Add Reference',
        filters: {
       'csproj files': ['csproj'],
        }
    };
    const fileUri = await window.showOpenDialog(options);
    if (!(fileUri && fileUri[0])) {
        throw new Error("Please select a project to add as a reference.")
    }
    return fileUri[0].fsPath;
}