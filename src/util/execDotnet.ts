import { Template } from '../dotnet/new/new';
import { exec, spawn } from 'promisify-child-process';

/**
 * Runs `dotnet sln <solutionPath> list` to list projects referenced by the solution
 */
export async function dotnetSlnList(solutionPath: string): Promise<string[]> {
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
        return ({ label: columns[2], description: columns.slice(-2)[0] });
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
    return execDotnet(`remove "${projectPath}" package ${packageId}`).then(() =>
        execDotnet(`restore "${projectPath}"`)
    );
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
 * EF - Add a migration
 * 
 * Runs `dotnet ef migration add <migrationname> -p <projectPath>`
 */
export async function dotnetEfAddMigration(projectPath: string, migrationname: string) {
    return execDotnet(`ef migrations add "${migrationname}" -p "${projectPath}"`);
}

/**
 * EF - Remove last migration
 * 
 * Runs `dotnet ef migration remove -p <projectPath>`
 */
export async function dotnetEfRemoveMigration(projectPath: string) {
    return execDotnet(`ef migrations remove -p "${projectPath}"`);
}

/**
 * EF - Show list of migrations
 * 
 * Runs `dotnet ef migrations list -p <projectPath>`
 */
export async function dotnetEfMigrationsList(projectPath: string) {
    return execDotnet(`ef migrations list -p "${projectPath}"`);
}

/**
 * EF - Update database
 * 
 * Runs `dotnet ef database update <migrationname> -p <projectPath>`
 */
export async function dotnetEfUpdateDatabase(projectPath: string, migrationname: string | undefined) {
    if (!migrationname) {
        return execDotnet(`ef database update -p "${projectPath}"`);
    }
    else {
        return execDotnet(`ef database update "${migrationname}" -p "${projectPath}"`);
    }
}

/**
 * EF - DBContext Info
 * 
 * Runs `dotnet ef dbcontext info -p <projectPath>`
 */
export async function dotnetEfDbContextInfo(projectPath: string) {
    return await execDotnet(`ef dbcontext info -p "${projectPath}"`);
}

/**
 * Retrieve list of templates that can be used with the dotnet new command
 * 
 * Runs `dotnet new --list`
 */
export async function dotnetNewList() {
    const output = await execDotnet("new --list");
    var index = output.findIndex(el => el.startsWith("------------------"));
    return output.slice(index + 1, -1)
        // filter out empty lines from output
        .filter(el => el != "")
        .map((el) => {
            // split by at least 3 whitespaces into columns
            const columns = el.split(/\s\s\s+/);
            return new Template(columns[0], columns[1], columns[2]);
        });
}

/**
 * Creates new item from given template
 * 
 * Runs `dotnet new <template> -n <name> -o <output>`
 */
export async function dotnetNew(template: string, name: string, output: string) {
    return execDotnet(`new "${template}" -n "${name}" -o "${output}"`);
}

/**
 * Executes the dotnet command and returns the stdout separated by line
 * @param command subcommand and arguments
 */
async function execDotnet(command: string): Promise<string[]> {
    try {
        const { stdout, stderr } = await exec(`dotnet ${command}`);
        if (stdout) {
            return stdout.toString('utf8').split(/\r?\n/);
        } else {
            return [];
        }
    } catch (e) {
        throw e.message + e.stdout;
    }
}