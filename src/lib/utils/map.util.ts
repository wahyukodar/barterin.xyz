export function GetGoogleMapsLink(param: { latitude: number; longitude: number }): string {
	return `https://www.google.com/maps?q=${param.latitude},${param.longitude}&hl=id&z=15`;
}
