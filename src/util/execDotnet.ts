import * as child from 'child_process';

/**
 * Runs `dotnet sln <command>` to list projects referenced by the solution
 */
export async function dotnetSln(command: string) : Promise<string[]> {
    const output = await execDotnet(`sln ${command}`);
    return output.slice(2, -1);
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
 * Install NuGet package into project.
 * 
 * Runs `dotnet add <projectPath> package <packageId> -v <version>`  
 */
export async function dotnetAddPackage(projectPath: string, packageId: string, version: string) {
    execDotnet(`add "${projectPath}" package ${packageId} -v ${version}`);
}

/**
 * Remove NuGet package from project.
 * 
 * Runs `dotnet remove <projectPath> package <packageId>`  
 */
export async function dotnetRemovePackage(projectPath: string, packageId: string) {
    execDotnet(`remove "${projectPath}" package ${packageId}`);
}

/**
 * Executes the dotnet command and returns the stdout separated by line
 * @param command subcommand and arguments
 */
async function execDotnet(command: string) : Promise<string[]> {
    return child.execSync(`dotnet ${command}`, {encoding: 'utf8'}).split(/\r?\n/);
}