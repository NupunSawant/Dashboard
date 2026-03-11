export function generateNextCode(
	itemName: string,
	existingCodes: string[],
	padLength: number = 3,
): string {
	//   Get initials from item name
	const prefix = itemName
		.trim()
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0].toUpperCase())
		.join("");

	if (!prefix) return "";

	//   Filter codes that start with this prefix
	const numbers = existingCodes
		.filter((code) => code?.startsWith(prefix))
		.map((code) => parseInt(code.replace(prefix, ""), 10))
		.filter((n) => !isNaN(n));

	const max = numbers.length > 0 ? Math.max(...numbers) : 0;
	return `${prefix}${String(max + 1).padStart(padLength, "0")}`;
}
