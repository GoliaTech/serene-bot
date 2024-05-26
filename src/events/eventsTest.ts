// This is a little bit more--- redundant, but it is much clearer code.
const rady = {
	"name": "rady",
	"once": true,
	execute() {
		console.log("we are ready");
	}
};

const kanektion = {
	"name": "kanektion",
	execute(title: string) {
		console.log("we are connecting");
	}
};

module.exports = [
	rady, kanektion
];