import { window, workspace, OpenDialogOptions, RelativePattern, QuickPickItem } from 'vscode';
import { dotnetSlnList } from './execDotnet';
import * as path from 'path';

/**
 * A QuickPickItem that holds information about a csharp project
 */
export class ProjectQuickPickItem implements QuickPickItem {
    projectFile: string;
    fsPath: string;

    get label(): string {
        return this.projectFile;
    };

    get description(): string {
        return this.fsPath;
    }

    constructor(fsPath: string) {
        console.log(fsPath);
        this.projectFile = path.win32.basename(fsPath);
        console.log(this.projectFile);
        this.fsPath = fsPath;
    }
}

/**
 * Interactive Dialog using QuickPick input to choose a csharp project from a list of filepaths to projects
 */
export async function selectProject(projects: Promise<string[]>) : Promise<string> {
    const projectItems = projects.then((projects) => projects.map((p) => new ProjectQuickPickItem(p)));
    const projectItem = await selectProjectItem(projectItems);
    return projectItem.fsPath;
}

/**
 * Obtain a list of csharp projects. If there is a solution file (.sln) present,
 * return the projects in the solution. Else search for a .csproj file in the workspace
 * directory.
 */
export async function getCsprojects() : Promise<string[]> {
    const workspacePath = await getWorkspace();
    var solutionPath = await getSolution(workspacePath, false);
    if (solutionPath !== "") {
        const projectPaths = await dotnetSlnList(solutionPath);
        return projectPaths.map((projectPath) => path.dirname(solutionPath) + "/" + projectPath);
    } else {
        const pattern = new RelativePattern(workspacePath, '**/*.csproj');
        const csproj_files = await workspace.findFiles(pattern, null);
        return csproj_files.map((uri) => uri.fsPath);
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

/**
 * Interactive Dialog using QuickPick input choose a project from a list of projectquickpickitems
 */
async function selectProjectItem(items: Promise<ProjectQuickPickItem[]>) : Promise<ProjectQuickPickItem> {
    const projectItem = await window.showQuickPick(items,
        { placeHolder: "Select Project"});
    if(!projectItem) {
        throw new Error("No project chosen")
    } else {
        return projectItem;
    }
}
