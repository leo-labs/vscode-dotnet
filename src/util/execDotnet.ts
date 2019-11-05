import * as child from 'child_process';

/**
 * Runs `dotnet sln <solutionPath> list` to list projects referenced by the solution
 */
export async function dotnetSlnList(solutionPath: string) : Promise<string[]> {
    const output = await execDotnet(`sln "${solutionPath}" list`);
    return output.slice(2, -1);
}

/**
 * Runs `dotnet sln <solutionPath> add <projectPath>` to add a project to the solution
 */
export async function dotnetSlnAdd(solutionPath: string, projectPath: string) {
    return execDotnet(`sln "${solutionPath}" add "${projectPath}"`);
}

/**
 * Runs `dotnet sln <solutionPath> remove <projectPath>` to remove a project from the solution
 */
export async function dotnetSlnRemove(solutionPath: string, projectPath: string) {
    return execDotnet(`sln "${solutionPath}" remove "${projectPath}"`);
}

/**
 * List dotnet packages in csharp project, runs 
 * Run `dotnet list <projectPath> package` and parses
 * the output. 
 * https://github.com/NuGet/Home/issues/7752 will make this more stable
 */
export async function dotnetListPackages(projectPath: string) {
    const output = await execDotnet(`list ${projectPath} package`);
    // lines with packages start with '>'
    return output.filter(el => el.includes(">")).map(el => {
        // split by whitespaces into columns
        const columns = el.split(/\s+/);
        return ({ label: columns[2], details: columns.slice(-2)[0]});
    });
}

/**
 * List dotnet references in csharp project, runs 
 * Run `dotnet list <projectPath> reference` and parses
 * the output. 
*/
export async function dotnetListReferences(projectPath: string) {
    const output = await execDotnet(`list ${projectPath} reference`);
    return output.slice(2, -1);
}

/**
 * Install NuGet package into project.
 * 
 * Runs `dotnet add <projectPath> package <packageId> -v <version>`  
 */
export async function dotnetAddPackage(projectPath: string, packageId: string, version: string) {
    return execDotnet(`add "${projectPath}" package ${packageId} -v ${version}`);
}

/**
 * Remove NuGet package from project.
 * 
 * Runs `dotnet remove <projectPath> package <packageId>`  
 */
export async function dotnetRemovePackage(projectPath: string, packageId: string) {
    return execDotnet(`remove "${projectPath}" package ${packageId}`);
}

/**
 * Add a project-to-project reference to a project
 * 
 * Runs `dotnet add <projectPath> reference <projectPath>`  
 */ 
export async function dotnetAddReference(projectPath: string, referenceProjectPath: string) {
    return execDotnet(`add "${projectPath}" reference "${referenceProjectPath}"`);
}

/**
 * Remove a project-to-project reference from the project.
 * 
 * Runs `dotnet remove <projectPath> reference <projectPath>`
 */
export async function dotnetRemoveReference(projectPath: string, referenceProjectPath: string) {
    return execDotnet(`remove "${projectPath}" reference "${referenceProjectPath}"`);
}

/**
 * Executes the dotnet command and returns the stdout separated by line
 * @param command subcommand and arguments
 */
async function execDotnet(command: string) : Promise<string[]> {
    return child.execSync(`dotnet ${command}`, {encoding: 'utf8'}).split(/\r?\n/);
}