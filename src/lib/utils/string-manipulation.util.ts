export function CapitalizeFirstLetter(inputString: string): string {
    if (inputString.length === 0) {
        return inputString; // Return unchanged if the string is empty
    }

    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
}
