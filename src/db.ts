import { tracer } from "./env";

export async function getUsers(name?: string) {
	const span = tracer.startSpan("getUsers");
	const users = [
		{
			id: 1,
			name: "John Doe",
		},
		{
			id: 2,
			name: "Jane Doe",
		},
	];

	if (name) {
		const filteredUsers = users.filter((user) => user.name.includes(name));
		span.setAttributes({
			"users.name": name,
			"users.count": filteredUsers.length,
		});
		return filteredUsers;
	}

	span.setAttributes({
		"users.count": users.length,
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));
	span.end();

	return users;
}
