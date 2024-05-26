module.exports = [
	{
		name: "ready",
		once: true,
		execute() {
			console.log("we are ready");
		}
	},
	{
		name: "connect",
		execute() {
			console.log("we are connecting");
		}
	}
];