import axios from "axios";

const NUGET_AUTOCOMPLETE = "https://api-v2v3search-0.nuget.org/autocomplete?";
const NUGET_AUTOCOMPLETE_PARAM = "&take=15&prerelease=true&semVerLevel=2.0.0";

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
    return axios.get(NUGET_AUTOCOMPLETE + query + NUGET_AUTOCOMPLETE_PARAM).then((response) => { 
        return response.data.data;
    });
}