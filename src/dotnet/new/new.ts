import { dotnetNewList, dotnetNew, dotnetSlnAdd } from "../../util/execDotnet";
import { window, OpenDialogOptions, ProgressLocation, QuickPickItem, RelativePattern, workspace, Uri } from "vscode";
import * as path from 'path';
import { getSolution, getWorkspace } from "../../util/ProjectSelector";

/**
 * Holds information about templates that can be used with dotnet new
 */
export class Template implements QuickPickItem {
    name: string;
    shortName: string;
    isProject: boolean;
    isSolution: boolean;

    get label(): string {
        return this.name;
    };

    get description(): string {
        return this.shortName;
    }

    constructor(name: string, shortName: string, languages: string) {
        this.name = name;
        this.shortName = shortName;
        this.isProject = languages.includes("[C#]");
        this.isSolution = languages.includes("Solution");
    }
}

/**
 * Create new dotnet object from template. Projects can be added to opened solutions,
 * projects and solution will be opened in a new workspace
 */
export async function newFromTemplate() {
    const template = await pickTemplate();
    const outputDirectory = await pickOutputDirectory();
    const name = await pickName(path.win32.basename(outputDirectory.path));
    var addToSolution = false;
    var solution = "";
    if (template.isProject && workspace.workspaceFolders) {
        const workspacePath = await getWorkspace();
        solution = await getSolution(workspacePath, false);
        if (solution) {
            addToSolution = await pickOption();
        }
    }
    return window.withProgress({
        location: ProgressLocation.Notification,
        title: `Create new ${template.name}`,
        cancellable: false
    },     
    async (progress, token): Promise<string[]> => {
        var resultNew = await dotnetNew(template.shortName, name, outputDirectory.fsPath);
        if(addToSolution){
            const pattern = new RelativePattern(outputDirectory.path, '**/*.csproj');
            const csproj_files = await workspace.findFiles(pattern, null);
            if (csproj_files.length != 1) {
                throw new Error("Could not add project to solution.")
            }
            const resultAdd = dotnetSlnAdd(solution, csproj_files[0].fsPath);
            return Promise.all([resultNew, resultAdd]).then((values) => {
                return values[0].concat(...values.slice(1))});
        } else if(template.isProject || template.isSolution) {
            workspace.updateWorkspaceFolders(0, 0, { uri: outputDirectory});
        }
        return resultNew;
    });
}

/**
 * QuickPick dialog for choosing a name
 */
async function pickName(defaultValue: string) {
    const name = await window.showInputBox({ prompt: "Specify the name", value: defaultValue});
    if (!name) {
        throw new Error("No name chosen");
    }
    return name;
}

/**
 * QuickPick dialog for choosing a dotnet template
 */
async function pickTemplate() {
    const template = await window.showQuickPick(dotnetNewList(),
        { placeHolder: "Select Template"});
    if (!template) {
        throw new Error("No Template chosen");
    }
    return template;
}

/**
 * QuickPick dialog for choosing an output directory
 */
async function pickOutputDirectory() {
    const options: OpenDialogOptions = {
        canSelectMany: false,
        canSelectFiles: false,
        canSelectFolders: true,
        openLabel: 'Choose Output Directory',
    };
    const outputDirectory = await window.showOpenDialog(options);
    if (!outputDirectory) {
        throw new Error("No output directory chosen");
    }
    return outputDirectory[0];
}

/**
 * QuickPick dialog to choose if project should be added to already open solution
 */
async function pickOption() {
    const result = await window.showQuickPick(["Yes", "No"],
        { placeHolder: "Add to solution", });
    if (!result) {
        throw new Error("No option chosen");
    }
    return result == "Yes";
}