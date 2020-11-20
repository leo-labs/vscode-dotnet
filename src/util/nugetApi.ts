import axios from "axios";

const NUGET_AUTOCOMPLETE = "https://azuresearch-usnc.nuget.org/autocomplete?";
const NUGET_AUTOCOMPLETE_PARAM = "&take=15&prerelease=true&semVerLevel=2.0.0";

const NUGET_SEARCH = "https://azuresearch-usnc.nuget.org/query?q=";
const NUGET_SEARCH_PARAM = "&take=1&prerelease=false&semVerLevel=2.0.0";

/**
 * Autocomplete Search for package identifier
 * https://docs.microsoft.com/de-de/nuget/api/search-autocomplete-service-resource
 * Includes prerelease packages
 * @param q search term for package identifier
 */
export async function searchAutocompletePackageId(q: string) : Promise<string[]> {
    const query = `q=${q}`;
    return searchAutocomplete(query);
}

/**
 * Autocomplete search for versions for a package. This API is faster than to query 
 * the package information via the `SearchQueryService` 
 * @param packageId The package identifier
 */
export async function searchAutocompleteVersion(packageId: string) : Promise<string[]> {
    const query = `id=${packageId}`;
    return searchAutocomplete(query).then((versions) => versions.reverse());
}

/**
 * Connects to the nuget`SearchAutocompleteService` and returns the result of
 * @param query the query
 */
async function searchAutocomplete(query: string) {
    var response = await axios.get(NUGET_AUTOCOMPLETE + query + NUGET_AUTOCOMPLETE_PARAM);
    return response.data.data;
}

/**
 * Metadata of a NuGet package
 */
export class PackageMetadata {
    constructor(readonly verified = false,
        readonly latestVersion = "",
        readonly description = "",
        readonly authors: string[] = [],
        readonly totalDownloads = 0) { }
}

/**
 * load package metadata from NuGet api for package identifier
 * @param packageId the package identifier
 */
export async function queryPackageMetadata(packageId: string) {
    var response = await axios.get(NUGET_SEARCH + "PackageId:" + packageId + NUGET_SEARCH_PARAM);
    if(response.data.data.length == 0) {
        return new PackageMetadata();
    };

    var data = response.data.data[0];

    return new PackageMetadata(data.verified, data.versions.slice(-1)[0].version, data.description,
        data.authors, data.totalDownloads);
}