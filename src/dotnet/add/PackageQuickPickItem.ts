import { QuickPickItem } from "vscode";
import { queryPackageMetadata, PackageMetadata } from '../../util/nugetApi';

/**
 * QuickPickItem for NuGet package with metadata information
 */
export class PackageQuickPickItem implements QuickPickItem {

    get label(): string {
        return this.packageId;
    };

    get description(): string {
        var description = "";
        if (this.packageMetadata.verified) {
            description += '$(verified) ';
        }
        description += " $(versions) ";
        description += this.packageMetadata.latestVersion;
        description += " $(person)";
        description += this.packageMetadata.authors.join(" ");
        description += " $(cloud-download) ";
        description += new Intl.NumberFormat("en-US").format(this.packageMetadata.totalDownloads);
        description += " total downloads";
        return description;
    }

    get detail() {
        return this.packageMetadata.description;
    }

    constructor(readonly packageId: string, readonly packageMetadata: PackageMetadata) { }
}

/**
 * Create a `PackageQuickPickItem` from a NuGet package identifier
 * @param packageId the package identifier
 */
export async function CreatePackageQuickPickItem(packageId: string) : Promise<PackageQuickPickItem> {
    var metadata = await queryPackageMetadata(packageId);
    return new PackageQuickPickItem(packageId, metadata);
}