export const getInputType = (field: string) => {
	if (field.includes("password")) {
		return "password";
	}
	if (field === "email") {
		return "email";
	}
	return "text";
};
