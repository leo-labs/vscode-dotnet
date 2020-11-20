[![VS Marketplace Installs](https://vsmarketplacebadge.apphb.com/installs/leo-labs.dotnet.svg)](https://marketplace.visualstudio.com/items?itemName=leo-labs.dotnet)
[![GitHub license](https://img.shields.io/github/license/leo-labs/vscode-dotnet.svg)](https://github.com/matijarmk/dotnet-core-commands/blob/master/LICENSE)

# dotnet, A Visual Studio Code extension

A modern interface to the dotnet & Entity Framework Core CLI for Visual Studio Code.

This extension provides access to the dotnet & EF CLI by using the Quick Pick UI. 

## Usage

* Open the command palette by pressing <kbd>Shift</kbd> + <kbd>&#8984;</kbd> + <kbd>P</kbd> or <kbd>F1</kbd>
* Start typing `dotnet` and choose your desired commmand

## Features

* Create dotnet objects like projects, solutions from templates (`dotnet new`)

![Create solution](images/demo/demo_new_solution.gif)

![Create project](images/demo/demo_new_project.gif)

* Add/Upgrade/Downgrade/Remove NuGet packages (`dotnet add package`, `dotnet remove package`)

![Add package](images/demo/demo_add_package.gif)

![Remove package](images/demo/demo_remove_package.gif)

* Add/Remove project-to-project references (`dotnet add reference`, `dotnet remove reference`)

* Add/Remove projects to/from solutions (`dotnet sln add`, `dotnet sln remove`) 

### Entity Framework Core

* Add/Remove migrations (`dotnet ef migrations add`, `dotnet ef migrations remove`) 

* List migrations (`dotnet ef migrations list`) 
 
* Update database (`dotnet ef database update`) 
  
* Show dbcontext info (`dotnet ef dbcontext info`) 